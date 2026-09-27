import sys
import os

# Add parent directory to path so imports work seamlessly on Vercel Serverless
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
