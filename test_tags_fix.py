#!/usr/bin/env python3
"""
测试 tags 字段的各种数据类型处理
"""

from data_processor import process_data

def test_tags_handling():
    """测试各种 tags 数据类型"""
    print("🧪 测试 tags 字段处理...")
    
    test_cases = [
        # 正常列表
        {'tags': ['defi', 'ethereum'], 'name': 'Test1', 'symbol': 'T1', 'description': 'Test', 'category': 'test'},
        # None 值
        {'tags': None, 'name': 'Test2', 'symbol': 'T2', 'description': 'Test', 'category': 'test'},
        # 字符串
        {'tags': 'defi,ethereum', 'name': 'Test3', 'symbol': 'T3', 'description': 'Test', 'category': 'test'},
        # 空列表
        {'tags': [], 'name': 'Test4', 'symbol': 'T4', 'description': 'Test', 'category': 'test'},
    ]
    
    for i, test_detail in enumerate(test_cases, 1):
        test_ucids = [i]
        test_coin_details = {str(i): test_detail}
        test_market_data = {
            str(i): {
                'circulating_supply': 1000000,
                'total_supply': 2000000,
                'quote': {'USD': {'fully_diluted_valuation': 50000000}}
            }
        }
        
        try:
            result = process_data(test_ucids, test_coin_details, test_market_data)
            print(f'✅ Test case {i} passed: tags={test_detail["tags"]}')
        except Exception as e:
            import traceback
            print(f'❌ Test case {i} failed: {e}')
            print(f'Full traceback: {traceback.format_exc()}')
    
    print("All tag tests completed!")

if __name__ == "__main__":
    test_tags_handling()
