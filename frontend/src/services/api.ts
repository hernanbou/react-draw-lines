import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:5000', // URL da sua API
});

