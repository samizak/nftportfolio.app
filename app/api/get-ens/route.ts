import { NextResponse } from 'next/server';
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/"+process.env.INFURA_API_KEY);


export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing Ethereum address (id query parameter)' }, { status: 400 });
  }

  try {
    const ensName = await provider.lookupAddress(id);
    return NextResponse.json({
      "address": id,
      "ens": ensName
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
