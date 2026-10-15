export class Address {
  street?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

export class Employee {
  id!: string;
  name!: string;
  email!: string;
  department!: string;
  status!: string;
  address?: Address;
}
