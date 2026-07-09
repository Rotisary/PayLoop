interface Customer {
    id: string;
}


export interface MonoCreateMandateRequest {
    amount: number;
    type: string;
    method: string;
    mandate_type: string;
    debit_type: string;
    account_number: string;
    bank_code: string;
    description: string;
    reference: string;
    customer: Customer;
    start_date: string;
    end_date: string;
}


export interface MonoCreateMandateResponse {
    status: string;
    message: string;
    data: {
        mandate_id: string;
        type: string;
        method: string;
        amount: number;
        mandate_type: string;
        mono_url: string;
        description: string;
        reference: string;
        customer: string;
        redirect_url: string;
        created_at: string;
        updated_at: string;
        start_date: string;
        end_date: string;
    }
}