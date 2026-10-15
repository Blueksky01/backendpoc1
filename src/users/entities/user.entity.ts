export class Address {
  houseNumber?: string;
  villageNo?: string;
  village?: string;
  road?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

export class User {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  birthDate!: string;
  nickname!: string;
  gender!: string;
  email!: string;
  createdAt!: string;
  address?: Address;
}
