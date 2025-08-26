#!/usr/bin/env python3
"""
测试修复后的代码是否能正确处理边界情况
"""

from cmc_fetcher import extract_social_data, extract_urls
from data_processor import process_data

def test_extract_functions():
    """测试提取函数的边界情况"""
    print("🧪 测试提取函数...")

    # 测试空列表
    result1 = extract_social_data({'twitter': [], 'telegram': []})
    assert result1['twitter_followers'] is None
    assert result1['telegram_members'] is None
    print("✅ 空列表测试通过")

    # 测试空字典
    result2 = extract_social_data({})
    assert result2['twitter_followers'] is None
    assert result2['telegram_members'] is None
    print("✅ 空字典测试通过")

    # 测试字符串类型数据（实际API返回格式）
    result3 = extract_social_data({'twitter': ['https://twitter.com/bitcoin'], 'telegram': ['https://t.me/bitcoin']})
    assert result3['twitter_followers'] is None  # 字符串类型不包含followers信息
    assert result3['telegram_members'] is None   # 字符串类型不包含members信息
    print("✅ 字符串类型数据测试通过")

    # 测试字典类型数据
    result4 = extract_social_data({'twitter': [{'followers': 1000000}], 'telegram': [{'members': 50000}]})
    assert result4['twitter_followers'] == 1000000
    assert result4['telegram_members'] == 50000
    print("✅ 字典类型数据测试通过")

    # 测试URL提取
    result5 = extract_urls({'website': [], 'whitepaper': [], 'twitter': []})
    assert result5['website'] == ''
    assert result5['whitepaper'] == ''
    assert result5['twitter'] == ''
    print("✅ URL提取测试通过")

def test_data_processor():
    """测试数据处理器的边界情况"""
    print("🧪 测试数据处理器...")
    
    # 模拟可能导致错误的数据结构
    test_ucids = [1]
    test_coin_details = {
        '1': {
            'name': 'Test Coin',
            'symbol': 'TEST',
            'description': None,  # 这之前可能导致错误
            'urls': {
                'twitter': [],  # 空列表之前可能导致错误
                'telegram': [],
                'website': [],
                'whitepaper': []
            },
            'tags': ['test'],
            'category': 'test'
        }
    }
    test_market_data = {
        '1': {
            'circulating_supply': 1000000,
            'total_supply': 2000000,
            'quote': {
                'USD': {
                    'fully_diluted_valuation': 50000000
                }
            }
        }
    }
    
    result = process_data(test_ucids, test_coin_details, test_market_data)
    assert len(result) == 1
    assert result[0]['id'] == 'cmc-1'
    assert '无简介' in result[0]['token_info']
    print("✅ 数据处理器测试通过")

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 开始测试修复后的代码")
    print("=" * 50)
    
    try:
        test_extract_functions()
        test_data_processor()
        print("\n🎉 所有测试通过！修复成功！")
    except Exception as e:
        print(f"\n❌ 测试失败：{e}")
        raise
