export interface UserProfile {
  username: string;
  address: string;
  profile_image_url: string;
  banner_image_url: string;
  joined_date: string;
}

export interface EnsData {
  ens: string;
  address: string;
}

export interface User {
  name: string;
  ethHandle: string;
  ethAddress: string;
  avatar: string;
  banner: string;
}
