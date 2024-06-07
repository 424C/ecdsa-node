const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "020112548e1f42b691a8669655ba686464f0c7137f5db260d9df5791b2051d4f53": 100,
  "025ec5c7bedfbe4259b65eb632c76ca6a76fd00006cccbe2a6c0f8c2e0f14f58c5": 50,
  "027abc0a85a2e22f1aa758006ca2f9b738d140e896709b7c8e9bade306ef81ebbd": 75,

  /*
  private key:  1f73caa7e88e8bf80290c4908a16d751bca12590dc6ee3f452746375c629bee5
public key:  020112548e1f42b691a8669655ba686464f0c7137f5db260d9df5791b2051d4f53
eth address:  0xc20c6895dad85981cc7b7cee2a4b8ae45b1b39af

private key:  b7c4234baa14a97b4d61794fe5eaa12b081af61cc2e09b1bcf53d772728397cd
public key:  025ec5c7bedfbe4259b65eb632c76ca6a76fd00006cccbe2a6c0f8c2e0f14f58c5
eth address:  0x037edb2c19846371fdee51c37b7e9b7d9aa49acc

private key:  1afca244358da34195912edc22a3def8be6d5e9f6df1ee0ac62bdfc5c88af797
public key:  027abc0a85a2e22f1aa758006ca2f9b738d140e896709b7c8e9bade306ef81ebbd
eth address:  0x414bf3fd365600154fcb9dc8c75b821634346f11
*/
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, sig: sigBigInt, msg } = req.body;
  if (!msg) {
    console.log("Missing 'msg' in request body!");
    res.status(400).send({ message: "Missing 'msg' in request body!" });
    return;
  }
  const { recipient, amount } = msg;

  const sig = {
    ...sigBigInt,
    r: BigInt(sigBigInt.r),
    s: BigInt(sigBigInt.s),
  }; // Convert r and s to BigInt

  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender);

  if (!isValid) {
    res.status(400).send({ message: "Invalid signature!" });
    return;
  }
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
