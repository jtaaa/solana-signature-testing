import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

const solanaClientMessage = process.argv[2];
const SK = bs58.decode(process.argv[3]);
const keypair = web3.Keypair.fromSecretKey(SK);

const hexToBytes = (hex: string) => {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    // NOTE: `substr` method behaviour is different and cannot be replaced by `substring`
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return new Uint8Array(bytes);
};

const signSolanaMessage = (message: string) => {
  if (Buffer.isBuffer(message)) {
    throw new Error("Wrong Message Data Type");
  }
  const buf = hexToBytes(message as string);
  const transaction = web3.Transaction.from(buf as unknown as Uint8Array);
  try {
    transaction.partialSign(keypair);
    const signature = transaction.signatures.find(
      (sig) => sig.publicKey.toBase58() === keypair.publicKey.toBase58()
    );
    if (!signature?.signature) {
      throw new Error("No matching signature");
    }
    return Buffer.from(signature.signature).toString("hex");
  } catch (error) {
    console.error(error);
    throw new Error("A signing error occurred");
  }
};

const signature = signSolanaMessage(solanaClientMessage);
console.log({ signature });
