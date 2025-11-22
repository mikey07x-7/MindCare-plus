"""
federated_server.py

- Flower-based federated learning server skeleton.
- Run `python -m backend.app.models.federated_server server` to start server.
- Use client code (function below) on devices to join training rounds.
"""

import argparse
import flwr as fl
import logging
from typing import Dict, Tuple, List
import torch
import os
from app.config import settings

logger = logging.getLogger(__name__)

# Define a simple strategy - use FedAvg default
def start_server(port: int = 8080, rounds: int = 3):
    strategy = fl.server.strategy.FedAvg(
        fraction_fit=0.5,
        fraction_evaluate=0.5,
        min_fit_clients=1,
        min_evaluate_clients=1,
        min_available_clients=1,
    )
    server_address = f"0.0.0.0:{port}"
    logger.info(f"Starting Flower server on {server_address} for {rounds} rounds.")
    fl.server.start_server(server_address=server_address, config={"num_rounds": rounds}, strategy=strategy)

# Example client implementation - adapt model/dataloader to your environment
class SimpleClient(fl.client.NumPyClient):
    def __init__(self, model: torch.nn.Module, train_loader, test_loader):
        self.model = model
        self.train_loader = train_loader
        self.test_loader = test_loader

    def get_parameters(self):
        # Convert PyTorch model parameters to list of NumPy arrays
        return [val.cpu().detach().numpy() for _, val in self.model.state_dict().items()]

    def set_parameters(self, parameters):
        params_dict = zip(self.model.state_dict().keys(), parameters)
        state_dict = {k: torch.tensor(v) for k, v in params_dict}
        self.model.load_state_dict(state_dict, strict=False)

    def fit(self, parameters, config):
        self.set_parameters(parameters)
        # local training loop (very short example)
        self.model.train()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=1e-3)
        loss_fn = torch.nn.CrossEntropyLoss()
        for epoch in range(1):
            for xb, yb in self.train_loader:
                logits = self.model(xb)
                loss = loss_fn(logits, yb)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
        return self.get_parameters(), len(self.train_loader.dataset), {}

    def evaluate(self, parameters, config):
        self.set_parameters(parameters)
        self.model.eval()
        loss = 0.0
        correct = 0
        total = 0
        loss_fn = torch.nn.CrossEntropyLoss(reduction='sum')
        with torch.no_grad():
            for xb, yb in self.test_loader:
                logits = self.model(xb)
                loss += loss_fn(logits, yb).item()
                preds = logits.argmax(dim=1)
                correct += (preds == yb).sum().item()
                total += yb.size(0)
        return float(loss / total), total, {"accuracy": correct / total}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["server", "client"], help="Run as server or client")
    parser.add_argument("--port", type=int, default=8080)
    parser.add_argument("--rounds", type=int, default=3)
    args = parser.parse_args()
    if args.mode == "server":
        start_server(port=args.port, rounds=args.rounds)
    else:
        # Client mode: demo only - user should wire up DataLoader + model before running
        print("Client mode is a skeleton. Wire up model and dataloaders to run locally.")
        # Example:
        # client = SimpleClient(model, train_loader, test_loader)
        # fl.client.start_numpy_client(server_address="127.0.0.1:8080", client=client)
        raise SystemExit("Client skeleton - implement model and dataloaders before running.")

if __name__ == "__main__":
    main()
