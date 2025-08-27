#!/usr/bin/env python3
"""
AI代币寻找引擎 - API服务器
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from typing import List, Dict, Any
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 模拟数据
MOCK_TOKENS = [
    {
        "id": "1",
        "rank": 1,
        "symbol": "MATIC",
        "name": "Polygon",
        "description": "以太坊扩容解决方案，提供更快更便宜的交易体验，支持多种DeFi应用和NFT生态系统",
        "circulatingSupply": "8.00B",
        "totalSupply": "10.00B",
        "logo": "M",
        "whitepaperUrl": "https://polygon.technology/papers/pol-whitepaper",
        "twitterUrl": "https://twitter.com/0xPolygon",
        "website": "https://polygon.technology",
        "price": "$0.85",
        "change24h": "+5.2%",
        "marketCap": "$6.8B"
    },
    {
        "id": "2", 
        "rank": 2,
        "symbol": "LINK",
        "name": "Chainlink",
        "description": "去中心化预言机网络，为智能合约提供可靠的现实世界数据，是DeFi生态系统的重要基础设施",
        "circulatingSupply": "556.8M",
        "totalSupply": "1.00B",
        "logo": "L",
        "whitepaperUrl": "https://link.smartcontract.com/whitepaper",
        "twitterUrl": "https://twitter.com/chainlink",
        "website": "https://chain.link",
        "price": "$14.25",
        "change24h": "+2.8%",
        "marketCap": "$7.9B"
    },
    {
        "id": "3",
        "rank": 3,
        "symbol": "UNI",
        "name": "Uniswap",
        "description": "领先的去中心化交易协议，自动化做市商模式革新了代币交易方式，支持多链部署",
        "circulatingSupply": "753.8M",
        "totalSupply": "1.00B",
        "logo": "U",
        "whitepaperUrl": "https://uniswap.org/whitepaper-v3.pdf",
        "twitterUrl": "https://twitter.com/Uniswap",
        "website": "https://uniswap.org",
        "price": "$8.45",
        "change24h": "-1.2%",
        "marketCap": "$6.4B"
    }
]

@app.route('/')
def home():
    """首页"""
    return jsonify({
        "message": "AI代币寻找引擎 API",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/health')
def health_check():
    """健康检查"""
    return jsonify({
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    })

@app.route('/api/search', methods=['POST'])
def search_tokens():
    """搜索代币"""
    try:
        data = request.get_json()
        query = data.get('query', '').lower()
        
        logger.info(f"搜索查询: {query}")
        
        if not query:
            return jsonify({
                "error": "查询参数不能为空",
                "results": []
            }), 400
        
        # 简单的模糊搜索
        results = []
        for token in MOCK_TOKENS:
            if (query in token['name'].lower() or 
                query in token['symbol'].lower() or 
                query in token['description'].lower()):
                results.append(token)
        
        # 如果没有匹配结果，返回所有代币作为推荐
        if not results:
            results = MOCK_TOKENS[:3]
        
        return jsonify({
            "query": query,
            "results": results,
            "total": len(results)
        })
        
    except Exception as e:
        logger.error(f"搜索错误: {str(e)}")
        return jsonify({
            "error": "搜索服务暂时不可用",
            "results": []
        }), 500

@app.route('/api/token/<token_id>')
def get_token_details(token_id):
    """获取代币详情"""
    try:
        token = next((t for t in MOCK_TOKENS if t['id'] == token_id), None)
        
        if not token:
            return jsonify({
                "error": "代币不存在"
            }), 404
        
        return jsonify(token)
        
    except Exception as e:
        logger.error(f"获取代币详情错误: {str(e)}")
        return jsonify({
            "error": "获取代币详情失败"
        }), 500

@app.route('/api/trending')
def get_trending_tokens():
    """获取热门代币"""
    try:
        # 返回前3个代币作为热门推荐
        trending = MOCK_TOKENS[:3]
        
        return jsonify({
            "trending": trending,
            "total": len(trending)
        })
        
    except Exception as e:
        logger.error(f"获取热门代币错误: {str(e)}")
        return jsonify({
            "error": "获取热门代币失败"
        }), 500

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        "error": "API端点不存在",
        "message": "请检查请求URL"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        "error": "服务器内部错误",
        "message": "请稍后重试"
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"启动API服务器，端口: {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
