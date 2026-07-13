interface Identity {
    type: string,
    number: string
}


export interface MonoCreateCustomerRequest {
  identity: Identity,
  email: string,
  first_name: string,
  last_name: string,
  address: string,
  phone: string
}


export interface MonoCreateCustomerResponse {
    status: string;
    message: string;
    data: {
        id: string,
        name: string, 
        first_name: string,
        last_name: string,
        email: string,
        phone: string,
        address: string,
        identification_no: string,
        identification_type: string,
        bvn: string
    }
}