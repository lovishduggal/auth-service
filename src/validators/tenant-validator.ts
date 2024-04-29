import { checkSchema } from 'express-validator';

export default checkSchema({
    name: {
        errorMessage: 'Tenant name is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                max: 100,
            },
            errorMessage: 'Tenant name can not be more than 100 characters',
        },
    },
    address: {
        errorMessage: 'Address is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                max: 100,
            },
            errorMessage: 'Address can not be more than 255 characters',
        },
    },
});
//* OR
//* export default [body('email').notEmpty().withMessage('Email is required')];
