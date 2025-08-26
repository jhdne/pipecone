# main.py
from typing import List
from cmc_fetcher import fetch_ucids, fetch_coin_details, fetch_market_data
from data_processor import process_data
from pinecone_manager import init_pinecone_client, get_or_create_index, upsert_data_to_pinecone
from utils import save_ucids_snapshot

def embed_texts_with_pinecone(pc_client, texts: List[str]) -> List[List[float]]:
    """
    使用 Pinecone Inference API 对文本进行向量化。
    支持批量处理，每批最多96条（API限制）。
    """
    if not texts:
        return []

    # Pinecone llama-text-embed-v2 模型的输入限制是96条
    BATCH_SIZE = 96
    all_embeddings = []

    print(f"🚀 正在调用 Pinecone Inference API 对 {len(texts)} 条文本进行向量化...")

    # 分批处理
    for i in range(0, len(texts), BATCH_SIZE):
        batch_texts = texts[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(texts) + BATCH_SIZE - 1) // BATCH_SIZE

        print(f"📦 处理第 {batch_num}/{total_batches} 批，包含 {len(batch_texts)} 条文本...")

        try:
            # 调用 API 生成 embedding
            response = pc_client.inference.embed(
                model="llama-text-embed-v2",
                inputs=batch_texts,
                parameters={"input_type": "passage", "truncate": "END"}
            )
        
            # 从响应中提取向量列表
            if hasattr(response, 'data') and response.data:
                batch_embeddings = []
                for item in response.data:
                    if hasattr(item, 'values'):
                        batch_embeddings.append(item.values)
                    else:
                        print(f"⚠️ 响应项缺少 values 属性: {item}")
                        return []
                all_embeddings.extend(batch_embeddings)
                print(f"✅ 第 {batch_num} 批成功获取 {len(batch_embeddings)} 条向量")
            else:
                print(f"❌ 第 {batch_num} 批响应中没有数据")
                return []

        except Exception as e:
            print(f"❌ 第 {batch_num} 批调用 Pinecone Inference API 失败: {e}")
            return []

    print(f"🎉 所有批次完成！总共获取 {len(all_embeddings)} 条向量")
    return all_embeddings

def run_sync_process(ucids: List[int]):
    """执行同步的核心流程"""
    if not ucids:
        print("无 UCID 需要处理。")
        return

    # 1. 拉取数据 (不变)
    coin_details = fetch_coin_details(ucids)
    market_data = fetch_market_data(ucids)
    if not coin_details or not market_data:
        print("❌ 获取详情或市场数据失败，流程终止")
        return

    # 2. 处理数据 (不变)
    processed_list = process_data(ucids, coin_details, market_data)
    if not processed_list: return

    # 3. 初始化 Pinecone 客户端 (提前)
    # 因为向量化和存储都需要用到它
    print("\n初始化 Pinecone 客户端...")
    pc_client = init_pinecone_client()
    if not pc_client: return

    # 4. 向量化 (使用新的函数)
    texts_to_embed = [item["token_info"] for item in processed_list]
    vectors = embed_texts_with_pinecone(pc_client, texts_to_embed)
    if not vectors: # 如果向量化失败，则终止流程
        print("❌ 向量化失败，流程终止。")
        return

    # 5. 准备最终数据 (不变)
    pinecone_data = [
        {"id": item["id"], "values": vectors[i], "metadata": item["metadata"]}
        for i, item in enumerate(processed_list)
    ]
    print("✅ 数据已转换为 Pinecone 格式")

    # 6. 存储到 Pinecone
    print("\n存储到 Pinecone...")
    index = get_or_create_index(pc_client)
    if not index: return
    upsert_data_to_pinecone(index, pinecone_data)

def main():
    print("=" * 60)
    print("📌 开始执行【首次全量同步】流程")
    print("=" * 60)

    all_ucids = fetch_ucids()
    if not all_ucids: return

    print(f"🔍 本次处理 {len(all_ucids)} 个代币 (全量同步)")
    run_sync_process(all_ucids)

    print("\n保存 UCID 快照...")
    save_ucids_snapshot(all_ucids)

    print("\n🎉 全量同步流程执行完毕！")

if __name__ == "__main__":
    main()