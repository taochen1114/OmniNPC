from langgraph.graph import START, END, StateGraph
from states.state import State
from nodes.init_node import init_node
from nodes.lunar_new_year_greeting_generation_node import (
    lunar_new_year_greeting_generation_node,
)


def create_graph() -> StateGraph:
    graph = StateGraph(State)

    graph.add_node("init_node", init_node)
    graph.add_node(
        "lunar_new_year_greeting_generation_node",
        lunar_new_year_greeting_generation_node,
    )

    graph.add_edge(START, "init_node")
    graph.add_edge("init_node", "lunar_new_year_greeting_generation_node")
    graph.add_edge("lunar_new_year_greeting_generation_node", END)

    return graph


def build_compiled_graph():
    graph = create_graph()
    return graph.compile()
