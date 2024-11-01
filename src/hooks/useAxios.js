import axios from 'axios';
import {useKeycloak} from '@react-keycloak/web';
import {BASE_URL} from "../constants.js";

const useAxios = () => {
    const {keycloak} = useKeycloak();
    const axiosInstance = axios.create({
        baseURL: BASE_URL,
    });


    axiosInstance.interceptors.request.use(
        (config) => {
            if (keycloak && keycloak.token) {
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

export default useAxios;
