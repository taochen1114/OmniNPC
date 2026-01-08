from langgraph.graph import END, START, StateGraph
from states.state import RAGState
from nodes.test_node import test_node


def create_graph() -> StateGraph:
    graph = StateGraph(RAGState)

    graph.add_node("test_node", test_node)

    graph.add_edge(START, "test_node")
    graph.add_edge("test_node", END)

    return graph


def build_compiled_graph():
    graph = create_graph()
    return graph.compile()
