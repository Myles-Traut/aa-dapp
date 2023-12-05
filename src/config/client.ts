import { clientEnv } from "@/env/client.mjs";
import { goerli } from "viem/chains";

export const chain = goerli;
export const isDev = clientEnv.NEXT_PUBLIC_ENV === "development";
export const magicApiKey = clientEnv.NEXT_PUBLIC_MAGIC_API_KEY!;