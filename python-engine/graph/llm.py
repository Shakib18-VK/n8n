from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import ToolNode
from graph.tools import ALL_TOOLS
import os

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

tool_node = ToolNode(ALL_TOOLS)
