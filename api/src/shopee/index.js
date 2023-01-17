import axios from "axios";
import {shopeeApi} from "../config/index.js";

const baseUrl = shopeeApi;

class Shopee {
    token;

    constructor(token) {
        this.token = token;
    }

    getHeaders() {
        const headers = {};
        headers["X-Requested-With"] = "XMLHttpRequest";
        headers["Content-Type"] = "application/json";
        headers.Accept = "application/json";
        headers.accept = "application/json, text/plain, */*";
        headers["accept-language"] = "en-US,en;q=0.9,vi;q=0.8";
        headers["x-foody-client-id"] = "238F478A-1EF6-4488-A421-7C79E559AC01";
        headers["x-foody-client-type"] = "3";
        headers["x-foody-client-version"] = "5.27.0";
        headers["x-foody-access-token"] = this.token;
        headers["x-foody-api-version"] = "1";
        headers["user-agent"] = "NOW/5.13.2 (iPhone13,3; ios 16.1.1; Scale/3)";
        headers["x-foody-app-type"] = "1004";
        headers["x-foody-client-language"] = "en";
        return headers;
    }

    async fetchApi(method, url, data = {}) {
        const response = await axios({
            method, data, url: `${baseUrl}${url}`, headers: this.getHeaders(),
        });
        return response.data;
    }

    async getShopeeProductOptions(shopId, dishId) {
        if (!shopId || !dishId) {
            return {};
        }
        return this.fetchApi("get", `/v5/buyer/store/dish/option_groups`, {
            restaurant_id: shopId, dish_id: dishId, delivery_type: 1, shipping_type: 1,
        });
    }

    async getShopeeProducts(shopId) {
        if (!shopId) {
            return [];
        }

        return this.fetchApi("get", `/v5/buyer/store/dishes?restaurant_id=${shopId}`);
    }
}

export default Shopee;
