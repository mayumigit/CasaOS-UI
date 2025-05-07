import {api} from "./service.js";

const PREFIX = "/v2/casaos";
const wifi = {
	getWifiStatus() {
		return api.get(`${PREFIX}/wifi`);
	},
	setupWiFi(data) {
		return api.post(`${PREFIX}/wifi`, data);
	},
	setupAP(){
		return api.post(`${PREFIX}/wifi/ap-mode`);
	}
}
export default wifi;
