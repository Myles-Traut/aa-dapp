import { SmartAccountSigner, WalletClientSigner } from "@alchemy/aa-core";
import { Magic } from "magic-sdk";
import { WalletClient, createWalletClient, custom } from "viem";
import { magicApiKey } from "@/config/client";

export const useMagicSigner = () => {
    if(typeof window === "undefined") {
        return{ magic: null, signer: null }
    }

    const magic = new Magic(magicApiKey);

    const magicClient: WalletClient = createWalletClient({
        transport: custom(magic.rpcProvider),
      });
    
      const magicSigner: SmartAccountSigner = new WalletClientSigner(
        magicClient as any,
        "magic"
      );
    return {magic, signer: magicSigner}
}