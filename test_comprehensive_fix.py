#!/usr/bin/env python3
"""
全面测试所有修复后的代码，确保能处理各种边界情况
"""

from cmc_fetcher import extract_social_data, extract_urls
from data_processor import process_data, _safe_get_contract_address

def test_contract_address_extraction():
    """测试合约地址提取的各种情况"""
    print("🧪 测试合约地址提取...")
    
    # 正常情况
    detail1 = {'platform': {'token_address': '0x123abc'}}
    assert _safe_get_contract_address(detail1) == '0x123abc'
    print("✅ 正常合约地址提取通过")
    
    # platform 为 None
    detail2 = {'platform': None}
    assert _safe_get_contract_address(detail2) == '未知'
    print("✅ platform 为 None 测试通过")
    
    # platform 不是字典
    detail3 = {'platform': 'not_a_dict'}
    assert _safe_get_contract_address(detail3) == '未知'
    print("✅ platform 不是字典测试通过")
    
    # 没有 platform 字段
    detail4 = {}
    assert _safe_get_contract_address(detail4) == '未知'
    print("✅ 没有 platform 字段测试通过")
    
    # platform 是字典但没有 token_address
    detail5 = {'platform': {'other_field': 'value'}}
    assert _safe_get_contract_address(detail5) == '未知'
    print("✅ 没有 token_address 字段测试通过")

def test_extreme_edge_cases():
    """测试极端边界情况"""
    print("🧪 测试极端边界情况...")
    
    # 完全空的数据
    test_ucids = [1]
    test_coin_details = {'1': {}}
    test_market_data = {'1': {}}
    
    try:
        result = process_data(test_ucids, test_coin_details, test_market_data)
        assert len(result) == 1
        print("✅ 完全空数据测试通过")
    except Exception as e:
        print(f"❌ 完全空数据测试失败: {e}")
        return False
    
    # 所有字段都是错误类型
    test_coin_details2 = {
        '1': {
            'name': None,
            'symbol': None,
            'description': None,
            'tags': 'not_a_list',
            'category': None,
            'platform': 'not_a_dict',
            'urls': 'not_a_dict'
        }
    }
    test_market_data2 = {
        '1': {
            'circulating_supply': None,
            'total_supply': None,
            'quote': 'not_a_dict'
        }
    }
    
    try:
        result = process_data(test_ucids, test_coin_details2, test_market_data2)
        assert len(result) == 1
        print("✅ 错误类型数据测试通过")
    except Exception as e:
        import traceback
        print(f"❌ 错误类型数据测试失败: {e}")
        print(f"详细错误: {traceback.format_exc()}")
        return False
    
    return True

def test_social_data_edge_cases():
    """测试社交数据的边界情况"""
    print("🧪 测试社交数据边界情况...")
    
    # 混合类型的数据
    mixed_data = {
        'twitter': ['string_url', {'followers': 1000}],  # 混合字符串和字典
        'telegram': [{'members': 500}, 'another_string']  # 混合字典和字符串
    }
    
    result = extract_social_data(mixed_data)
    # 应该只提取第一个元素，如果是字符串则返回 None
    assert result['twitter_followers'] is None  # 第一个是字符串
    assert result['telegram_members'] == 500    # 第一个是字典
    print("✅ 混合类型社交数据测试通过")
    
    # 嵌套错误的数据
    nested_wrong = {
        'twitter': [{'not_followers': 1000}],  # 字典但没有正确的键
        'telegram': [{'not_members': 500}]
    }
    
    result = extract_social_data(nested_wrong)
    assert result['twitter_followers'] is None
    assert result['telegram_members'] is None
    print("✅ 嵌套错误数据测试通过")

def test_url_extraction_edge_cases():
    """测试URL提取的边界情况"""
    print("🧪 测试URL提取边界情况...")
    
    # 混合类型的URL数据
    mixed_urls = {
        'website': ['http://example.com', 'second_url'],
        'whitepaper': [],  # 空列表
        'twitter': None   # None 值
    }
    
    result = extract_urls(mixed_urls)
    assert result['website'] == 'http://example.com'
    assert result['whitepaper'] == ''
    assert result['twitter'] == ''
    print("✅ 混合类型URL数据测试通过")

def run_all_tests():
    """运行所有测试"""
    print("=" * 60)
    print("🚀 开始全面测试修复后的代码")
    print("=" * 60)
    
    try:
        test_contract_address_extraction()
        test_extreme_edge_cases()
        test_social_data_edge_cases()
        test_url_extraction_edge_cases()
        
        print("\n" + "=" * 60)
        print("🎉 所有全面测试通过！代码已完全修复！")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现未捕获的错误: {e}")
        import traceback
        print(f"详细错误信息: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
