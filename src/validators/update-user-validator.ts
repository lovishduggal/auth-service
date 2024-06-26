import { checkSchema } from 'express-validator';

export default checkSchema({
    firstName: {
        errorMessage: 'First name is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'Last name is required',
        notEmpty: true,
        trim: true,
    },
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    tenantId: {
        notEmpty: true,
        trim: true,
        errorMessage: 'Tenant id is required',
    },
});
//* OR
//* export default [body('email').notEmpty().withMessage('Email is required')];
