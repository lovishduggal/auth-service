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
    },
    password: {
        errorMessage: 'Password is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: 'Password length should be at least 8 characters',
        },
    },
});
//* OR
//* export default [body('email').notEmpty().withMessage('Email is required')];
