import { NextResponse } from 'next/server';

export async function GET(req: any, res: any) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing Ethereum address (id query parameter)' }, { status: 400 });
  }

  const openseaUrl = `https://api.opensea.io/api/v2/accounts/${id}`;
  
  try {
    const response = await fetch(openseaUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-api-key': process.env.OPENSEA_API_KEY || ''
        }
      });
  
      if (!response.ok) {
        return NextResponse.json({ error: 'Error fetching data from OpenSea' }, { status: response.status });
      }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
