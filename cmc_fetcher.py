import requests
import time
from typing import List, Dict, Any
from config import CMC_CONFIG, BATCH_SIZE, REQUEST_DELAY

def _make_request_with_retry(url: str, headers: Dict, params: Dict, max_retries: int = 3) -> requests.Response:
    """带重试机制的请求函数"""
    for attempt in range(max_retries):
        try:
            response = requests.get(url=url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            return response
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:  # Too Many Requests
                wait_time = (attempt + 1) * 10  # 递增等待时间：10s, 20s, 30s
                print(f"⚠️ API限流，等待 {wait_time} 秒后重试 (尝试 {attempt + 1}/{max_retries})...")
                time.sleep(wait_time)
                if attempt == max_retries - 1:
                    raise  # 最后一次尝试失败，抛出异常
            else:
                raise  # 其他HTTP错误直接抛出
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise  # 最后一次尝试失败，抛出异常
            wait_time = (attempt + 1) * 5  # 网络错误等待时间较短
            print(f"⚠️ 网络错误，等待 {wait_time} 秒后重试 (尝试 {attempt + 1}/{max_retries})...")
            time.sleep(wait_time)

def _fetch_in_batches(ucids: List[int], endpoint_key: str, params_extra: Dict = None) -> Dict[str, Any]:
    """通用批量获取函数"""
    data_map: Dict[str, Any] = {}
    total_batches = (len(ucids) + BATCH_SIZE - 1) // BATCH_SIZE

    for batch_idx in range(total_batches):
        start_idx = batch_idx * BATCH_SIZE
        end_idx = start_idx + BATCH_SIZE
        batch_ucids_str = ",".join(map(str, ucids[start_idx:end_idx]))

        params = {"id": batch_ucids_str}
        if params_extra:
            params.update(params_extra)

        try:
            response = _make_request_with_retry(
                url=f"{CMC_CONFIG['base_url']}{CMC_CONFIG['endpoints'][endpoint_key]}",
                headers=CMC_CONFIG["headers"],
                params=params
            )

            try:
                data = response.json()
            except ValueError as e:
                print(f"❌ {endpoint_key} JSON 解析失败 (批次 {batch_idx+1}): {e}")
                continue

            # 安全地检查响应结构
            if not isinstance(data, dict):
                print(f"❌ {endpoint_key} 响应格式错误 (批次 {batch_idx+1}): 期望字典但得到 {type(data)}")
                continue

            status = data.get("status", {})
            if isinstance(status, dict) and status.get("error_code") == 0:
                response_data = data.get("data")
                if response_data:
                    data_map.update(response_data)
                    print(f"✅ {endpoint_key} 拉取：第 {batch_idx+1}/{total_batches} 批成功")
                else:
                    print(f"⚠️ {endpoint_key} 响应无数据 (批次 {batch_idx+1})")
            else:
                error_msg = status.get("error_message", "未知错误") if isinstance(status, dict) else "状态格式错误"
                print(f"❌ {endpoint_key} API 错误 (批次 {batch_idx+1}): {error_msg}")

        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint_key} 请求失败 (批次 {batch_idx+1}): {e}")

        time.sleep(REQUEST_DELAY)

    print(f"✅ {endpoint_key} 数据拉取完成，共获取 {len(data_map)} 个代币的数据")
    return data_map


def fetch_ucids() -> List[int]:
    """获取所有代币的 UCID 列表 - 使用分页获取全部数据"""
    print("ℹ️  正在获取所有代币的 UCID (分页获取全部数据)...")

    all_ucids = []
    start = 1  # CoinMarketCap API 从1开始计数
    limit = 5000  # 每页最大数量
    page = 1

    while True:
        print(f"📄 正在获取第 {page} 页数据 (从第 {start} 个代币开始)...")

        try:
            response = _make_request_with_retry(
                url=f"{CMC_CONFIG['base_url']}{CMC_CONFIG['endpoints']['map']}",
                headers=CMC_CONFIG["headers"],
                params={
                    "start": start,
                    "limit": limit
                }
            )

            try:
                data = response.json()
            except ValueError as e:
                print(f"❌ 第 {page} 页 JSON 解析失败: {e}")
                break

            # 安全地检查响应结构
            if not isinstance(data, dict):
                print(f"❌ 第 {page} 页响应格式错误: 期望字典但得到 {type(data)}")
                break

            status = data.get("status", {})
            if not (isinstance(status, dict) and status.get("error_code") == 0):
                error_msg = status.get("error_message", "未知错误") if isinstance(status, dict) else "状态格式错误"
                print(f"❌ 第 {page} 页 API 错误：{error_msg}")
                break

            page_data = data.get("data")
            if not page_data or not isinstance(page_data, list):
                print(f"⚠️ 第 {page} 页无数据或数据格式错误")
                break

            # 提取当前页的 UCID
            page_ucids = []
            for coin in page_data:
                if isinstance(coin, dict) and "id" in coin:
                    page_ucids.append(coin["id"])
                else:
                    print(f"⚠️ 跳过无效的代币数据: {coin}")

            if not page_ucids:
                print(f"⚠️ 第 {page} 页没有有效的代币数据，停止获取")
                break

            all_ucids.extend(page_ucids)
            print(f"✅ 第 {page} 页获取成功，本页 {len(page_ucids)} 个代币，累计 {len(all_ucids)} 个代币")

            # 如果本页数据少于 limit，说明已经是最后一页
            if len(page_ucids) < limit:
                print(f"📄 已到达最后一页 (第 {page} 页)")
                break

            # 准备下一页
            start += limit
            page += 1

            # 添加请求间隔，避免API限流
            time.sleep(REQUEST_DELAY)

        except requests.exceptions.RequestException as e:
            print(f"❌ 第 {page} 页请求失败：{e}")
            break

    print(f"🎉 UCID 全量获取完成！总共获取 {len(all_ucids)} 个代币")
    return all_ucids

def fetch_coin_details(ucids: List[int]) -> Dict[str, Any]:
    """批量获取代币详情"""
    return _fetch_in_batches(ucids, "info")

def fetch_market_data(ucids: List[int]) -> Dict[str, Any]:
    """批量获取市场数据"""
    return _fetch_in_batches(ucids, "quotes", CMC_CONFIG["quotes_params"])

def extract_social_data(links: Dict[str, Any]) -> Dict[str, Any]:
    """提取社交数据"""
    # 检查 links 是否为字典类型
    if not isinstance(links, dict):
        return {"twitter_followers": None, "telegram_members": None}

    # 安全地提取 Twitter 关注者数量
    twitter_data = links.get("twitter", [])
    twitter_followers = None
    if twitter_data and len(twitter_data) > 0:
        # 检查第一个元素是否是字典类型
        first_item = twitter_data[0]
        if isinstance(first_item, dict):
            twitter_followers = first_item.get("followers")

    # 安全地提取 Telegram 成员数量
    telegram_data = links.get("telegram", [])
    telegram_members = None
    if telegram_data and len(telegram_data) > 0:
        # 检查第一个元素是否是字典类型
        first_item = telegram_data[0]
        if isinstance(first_item, dict):
            telegram_members = first_item.get("members")

    return {
        "twitter_followers": twitter_followers,
        "telegram_members": telegram_members
    }

def extract_urls(urls: Dict[str, Any]) -> Dict[str, Any]:
    """提取 URL 信息"""
    # 检查 urls 是否为字典类型
    if not isinstance(urls, dict):
        return {"website": "", "whitepaper": "", "twitter": ""}

    # 安全地提取各种 URL
    website_data = urls.get("website", [])
    website = website_data[0] if website_data and len(website_data) > 0 else ""

    whitepaper_data = urls.get("whitepaper", [])
    whitepaper = whitepaper_data[0] if whitepaper_data and len(whitepaper_data) > 0 else ""

    twitter_data = urls.get("twitter", [])
    twitter = twitter_data[0] if twitter_data and len(twitter_data) > 0 else ""

    return {
        "website": website,
        "whitepaper": whitepaper,
        "twitter": twitter
    }