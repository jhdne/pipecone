# .github/workflows/initial_sync.yml

# 工作流的名称
name: Initial Full Sync

# 触发工作流的事件
on:
  # 关键：只允许手动触发
  workflow_dispatch:

jobs:
  # 任务的 ID
  full_sync:
    # 任务运行的虚拟环境
    runs-on: ubuntu-latest
    # 由于全量同步可能耗时较长，设置超时时间为6小时
    timeout-minutes: 360 

    steps:
      # 检出代码
      - name: Checkout repository
        uses: actions/checkout@v4

      # 设置 Python 环境
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      # 安装项目依赖
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      # 关键：执行 main.py 脚本进行全量同步
      - name: Run initial full sync script
        env:
          CMC_API_KEY: ${{ secrets.CMC_API_KEY }}
          PINECONE_API_KEY: ${{ secrets.PINECONE_API_KEY }}
        run: python main.py

      # 将生成的快照文件提交并推送回仓库
      - name: Commit and push the ucids_snapshot.json
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          git add ucids_snapshot.json
          git commit -m "Create initial ucids_snapshot.json via GitHub Actions"
          git push
