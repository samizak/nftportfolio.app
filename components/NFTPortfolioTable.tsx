import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { useMemo } from "react"

interface NFT {
  id: number;
  name: string;
  collection: string;
  image: string;
  floorPrice: number;
  profit: number;
}

interface CollectionData {
  collection: string;
  image: string;
  quantity: number;
  floorPrice: number;
  profit: number;
  value: number;
  percentage: number;
}

interface NFTPortfolioTableProps {
  searchQuery: string;
}

export default function NFTPortfolioTable({ searchQuery }: NFTPortfolioTableProps) {
  const mockData = [
    {
      id: 1,
      name: "Bored Ape #1234",
      collection: "BAYC",
      image: "https://placehold.co/400",
      floorPrice: 30.5,
      lastPrice: 35.2,
      profit: 15.4,
    },
    {
      id: 2,
      name: "Doodle #5678",
      collection: "Doodles",
      image: "https://placehold.co/400",
      floorPrice: 8.2,
      lastPrice: 10.1,
      profit: -2.3,
    },
    {
      id: 3,
      name: "Azuki #4231",
      collection: "Azuki",
      image: "https://placehold.co/400",
      floorPrice: 12.8,
      lastPrice: 14.5,
      profit: 1.7,
    },
    {
      id: 4,
      name: "CloneX #9876",
      collection: "CloneX",
      image: "https://placehold.co/400",
      floorPrice: 5.4,
      lastPrice: 6.2,
      profit: 0.8,
    },
    {
      id: 5,
      name: "Moonbird #3456",
      collection: "Moonbirds",
      image: "https://placehold.co/400",
      floorPrice: 7.9,
      lastPrice: 6.5,
      profit: -1.4,
    },
    {
      id: 6,
      name: "CryptoPunk #7890",
      collection: "CryptoPunks",
      image: "https://placehold.co/400",
      floorPrice: 65.2,
      lastPrice: 70.1,
      profit: 4.9,
    },
    {
      id: 7,
      name: "Pudgy Penguin #2345",
      collection: "Pudgy Penguins",
      image: "https://placehold.co/400",
      floorPrice: 4.2,
      lastPrice: 5.8,
      profit: 1.6,
    },
    {
      id: 8,
      name: "World of Women #6789",
      collection: "WoW",
      image: "https://placehold.co/400",
      floorPrice: 3.1,
      lastPrice: 2.8,
      profit: -0.3,
    },
    {
      id: 9,
      name: "Cool Cat #1122",
      collection: "Cool Cats",
      image: "https://placehold.co/400",
      floorPrice: 2.5,
      lastPrice: 3.2,
      profit: 0.7,
    },
    {
      id: 10,
      name: "Meebits #3344",
      collection: "Meebits",
      image: "https://placehold.co/400",
      floorPrice: 4.8,
      lastPrice: 4.2,
      profit: -0.6,
    },
    {
      id: 11,
      name: "Degen Toonz #5566",
      collection: "Degen Toonz",
      image: "https://placehold.co/400",
      floorPrice: 1.2,
      lastPrice: 1.8,
      profit: 0.6,
    },
    {
      id: 12,
      name: "Invisible Friends #7788",
      collection: "Invisible Friends",
      image: "https://placehold.co/400",
      floorPrice: 2.7,
      lastPrice: 3.5,
      profit: 0.8,
    },
    {
      id: 13,
      name: "Bored Ape #5432",
      collection: "BAYC",
      image: "https://placehold.co/400",
      floorPrice: 30.5,
      lastPrice: 28.7,
      profit: -1.8,
    },
    {
      id: 14,
      name: "Mutant Ape #9988",
      collection: "MAYC",
      image: "https://placehold.co/400",
      floorPrice: 15.3,
      lastPrice: 17.2,
      profit: 1.9,
    },
    {
      id: 15,
      name: "Goblintown #7766",
      collection: "Goblintown",
      image: "https://placehold.co/400",
      floorPrice: 0.8,
      lastPrice: 0.5,
      profit: -0.3,
    },
    {
      id: 16,
      name: "Doodle #1357",
      collection: "Doodles",
      image: "https://placehold.co/400",
      floorPrice: 8.2,
      lastPrice: 9.5,
      profit: 1.3,
    },
    {
      id: 17,
      name: "Otherdeed #2468",
      collection: "Otherside",
      image: "https://placehold.co/400",
      floorPrice: 1.9,
      lastPrice: 2.3,
      profit: 0.4,
    },
    {
      id: 18,
      name: "VeeFriends #3579",
      collection: "VeeFriends",
      image: "https://placehold.co/400",
      floorPrice: 5.6,
      lastPrice: 4.8,
      profit: -0.8,
    },
    {
      id: 19,
      name: "Cryptoadz #4680",
      collection: "Cryptoadz",
      image: "https://placehold.co/400",
      floorPrice: 3.4,
      lastPrice: 4.1,
      profit: 0.7,
    },
    {
      id: 20,
      name: "RTFKT Clone #5791",
      collection: "RTFKT",
      image: "https://placehold.co/400",
      floorPrice: 4.7,
      lastPrice: 5.3,
      profit: 0.6,
    },
    // --- Additional 80 NFT collections ---
    {
      id: 21,
      name: "Art Blocks #1063",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 22,
      name: "CryptoKitties #1066",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 23,
      name: "Pixel Pals #1069",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 24,
      name: "Retro Robots #1072",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 25,
      name: "Mystic Beasts #1075",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 26,
      name: "Digital Dreams #1078",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 27,
      name: "Neon Ninjas #1081",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 28,
      name: "Future Faces #1084",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 29,
      name: "Virtual Visions #1087",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 30,
      name: "Galactic Gamers #1090",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 31,
      name: "Art Blocks #1093",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 32,
      name: "CryptoKitties #1096",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 33,
      name: "Pixel Pals #1099",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 34,
      name: "Retro Robots #1102",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 35,
      name: "Mystic Beasts #1105",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 36,
      name: "Digital Dreams #1108",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 37,
      name: "Neon Ninjas #1111",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 38,
      name: "Future Faces #1114",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 39,
      name: "Virtual Visions #1117",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 40,
      name: "Galactic Gamers #1120",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 41,
      name: "Art Blocks #1123",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 42,
      name: "CryptoKitties #1126",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 43,
      name: "Pixel Pals #1129",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 44,
      name: "Retro Robots #1132",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 45,
      name: "Mystic Beasts #1135",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 46,
      name: "Digital Dreams #1138",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 47,
      name: "Neon Ninjas #1141",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 48,
      name: "Future Faces #1144",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 49,
      name: "Virtual Visions #1147",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 50,
      name: "Galactic Gamers #1150",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 51,
      name: "Art Blocks #1153",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 52,
      name: "CryptoKitties #1156",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 53,
      name: "Pixel Pals #1159",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 54,
      name: "Retro Robots #1162",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 55,
      name: "Mystic Beasts #1165",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 56,
      name: "Digital Dreams #1168",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 57,
      name: "Neon Ninjas #1171",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 58,
      name: "Future Faces #1174",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 59,
      name: "Virtual Visions #1177",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 60,
      name: "Galactic Gamers #1180",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 61,
      name: "Art Blocks #1183",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 62,
      name: "CryptoKitties #1186",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 63,
      name: "Pixel Pals #1189",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 64,
      name: "Retro Robots #1192",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 65,
      name: "Mystic Beasts #1195",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 66,
      name: "Digital Dreams #1198",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 67,
      name: "Neon Ninjas #1201",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 68,
      name: "Future Faces #1204",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 69,
      name: "Virtual Visions #1207",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 70,
      name: "Galactic Gamers #1210",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 71,
      name: "Art Blocks #1213",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 72,
      name: "CryptoKitties #1216",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 73,
      name: "Pixel Pals #1219",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 74,
      name: "Retro Robots #1222",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 75,
      name: "Mystic Beasts #1225",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 76,
      name: "Digital Dreams #1228",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 77,
      name: "Neon Ninjas #1231",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 78,
      name: "Future Faces #1234",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 79,
      name: "Virtual Visions #1237",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 80,
      name: "Galactic Gamers #1240",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 81,
      name: "Art Blocks #1243",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 82,
      name: "CryptoKitties #1246",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 83,
      name: "Pixel Pals #1249",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 84,
      name: "Retro Robots #1252",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 85,
      name: "Mystic Beasts #1255",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 86,
      name: "Digital Dreams #1258",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 87,
      name: "Neon Ninjas #1261",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 88,
      name: "Future Faces #1264",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 89,
      name: "Virtual Visions #1267",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 90,
      name: "Galactic Gamers #1270",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
    {
      id: 91,
      name: "Art Blocks #1273",
      collection: "Art Blocks",
      image: "https://placehold.co/400",
      floorPrice: 3.0,
      lastPrice: 2.3,
      profit: -0.7,
    },
    {
      id: 92,
      name: "CryptoKitties #1276",
      collection: "CryptoKitties",
      image: "https://placehold.co/400",
      floorPrice: 4.5,
      lastPrice: 4.5,
      profit: 0.0,
    },
    {
      id: 93,
      name: "Pixel Pals #1279",
      collection: "Pixel Pals",
      image: "https://placehold.co/400",
      floorPrice: 6.0,
      lastPrice: 6.7,
      profit: 0.7,
    },
    {
      id: 94,
      name: "Retro Robots #1282",
      collection: "Retro Robots",
      image: "https://placehold.co/400",
      floorPrice: 7.5,
      lastPrice: 8.9,
      profit: 1.4,
    },
    {
      id: 95,
      name: "Mystic Beasts #1285",
      collection: "Mystic Beasts",
      image: "https://placehold.co/400",
      floorPrice: 9.0,
      lastPrice: 7.6,
      profit: -1.4,
    },
    {
      id: 96,
      name: "Digital Dreams #1288",
      collection: "Digital Dreams",
      image: "https://placehold.co/400",
      floorPrice: 10.5,
      lastPrice: 9.8,
      profit: -0.7,
    },
    {
      id: 97,
      name: "Neon Ninjas #1291",
      collection: "Neon Ninjas",
      image: "https://placehold.co/400",
      floorPrice: 12.0,
      lastPrice: 12.0,
      profit: 0.0,
    },
    {
      id: 98,
      name: "Future Faces #1294",
      collection: "Future Faces",
      image: "https://placehold.co/400",
      floorPrice: 13.5,
      lastPrice: 14.2,
      profit: 0.7,
    },
    {
      id: 99,
      name: "Virtual Visions #1297",
      collection: "Virtual Visions",
      image: "https://placehold.co/400",
      floorPrice: 15.0,
      lastPrice: 16.4,
      profit: 1.4,
    },
    {
      id: 100,
      name: "Galactic Gamers #1300",
      collection: "Galactic Gamers",
      image: "https://placehold.co/400",
      floorPrice: 1.5,
      lastPrice: 0.1,
      profit: -1.4,
    },
  ];
  
  // Group NFTs by collection and calculate aggregated values
  const collectionData = useMemo(() => {
    // Group NFTs by collection
    const collections: Record<string, NFT[]> = {};
    mockData.forEach(nft => {
      if (!collections[nft.collection]) {
        collections[nft.collection] = [];
      }
      collections[nft.collection].push(nft);
    });
  // Calculate total portfolio value
    const totalValue = Object.values(collections).reduce((total, nfts) => {
      return total + nfts.length * nfts[0].floorPrice;
    }, 0);
  // Create collection data array
    return Object.entries(collections).map(([collection, nfts]): CollectionData => {
      const value = nfts.length * nfts[0].floorPrice;
      return {
        collection,
        image: nfts[0].image, // Use the first NFT's image as collection image
        quantity: nfts.length,
        floorPrice: nfts[0].floorPrice,
        profit: nfts.reduce((sum, nft) => sum + nft.profit, 0),
        value,
        percentage: (value / totalValue) * 100
      };
    });
  }, [mockData]);
  // Filter collections based on search query
  const filteredData = collectionData.filter(item =>
    item.collection.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (filteredData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground mb-2">No collections found matching &quot;{searchQuery}&quot;</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search term</p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Collection</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Floor Price</TableHead>
          <TableHead>Value (Ξ)</TableHead>
          <TableHead>Portfolio (%)</TableHead>
          <TableHead>Profit/Loss</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.collection}>
            <TableCell className="flex items-center gap-2">
              <Avatar>
                <img src={item.image || ''} alt={item.collection} />
              </Avatar>
              {item.collection}
            </TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>Ξ {item.floorPrice.toFixed(2)}</TableCell>
            <TableCell>Ξ {item.value.toFixed(2)}</TableCell>
            <TableCell>{item.percentage.toFixed(1)}%</TableCell>
            <TableCell className={item.profit > 0 ? "text-green-500" : "text-red-500"}>
              {item.profit > 0 ? "+" : ""}Ξ {item.profit.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}