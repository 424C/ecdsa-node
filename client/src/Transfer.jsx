import { useState } from "react";
import server from "./server";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  // State variables for the amount to send and the recipient's address
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  // Helper function to set state variables from input events
  const setValue = (setter) => (evt) => setter(evt.target.value);

  // Function to hash a message using keccak256
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  // Function to sign a message using the private key
  const signMessage = (msg) => secp256k1.sign(hashMessage(msg), privateKey);

  // Function to handle form submission
  async function transfer(evt) {
    evt.preventDefault();

    // Create the message object
    const msg = { amount: parseInt(sendAmount), recipient };
    // Sign the message
    const sig = signMessage(msg);

    // Function to stringify BigInts in the signature
    const stringifyBigInts = (obj) => {
      const str = JSON.stringify(obj, (_, v) =>
        typeof v === "bigint" ? v.toString() : v
      );
      return JSON.parse(str);
    };

    // Stringify the signature
    const sigStringified = stringifyBigInts(sig);

    // Create the transaction object
    const tx = {
      sig: sigStringified,
      msg,
      sender: address,
    };

    try {
      // Send the transaction to the server and update the balance
      const {
        data: { balance },
      } = await server.post(`send`, tx);
      setBalance(balance);
    } catch (ex) {
      // Alert any error messages
      alert(ex.response.data.message);
    }
  }

  // Render the form
  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
