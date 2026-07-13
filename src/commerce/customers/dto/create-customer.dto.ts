import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';


export class CustomerIdentityDto{
    @ApiProperty({ example: 'bvn', maxLength: 3 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(3)
    type!: string;
    
    @ApiProperty({ example: '09876543212', maxLength: 11 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(11)
    number!: string;
}


export class CreateCustomerDto {
    @ApiProperty({ example: 'Jane', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName!: string;

    @ApiProperty({ example: 'Doe', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName!: string;

    @ApiProperty({ example: 'janedoe@gmail.com', maxLength: 120 })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(120)
    email!: string;

    @ApiProperty({ example: '', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    address!: string;

    @ApiProperty({ example: '08034587119', maxLength: 11 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(11)
    phone!: string;

    @ApiProperty({ example: 'Zenith Bank', maxLength: 120 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    bankName!: string;

    @ApiProperty({ example: '0123456789', maxLength: 32 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    bankAccountNumber!: string;

    @ApiProperty({type: CustomerIdentityDto})
    identity!: CustomerIdentityDto
}