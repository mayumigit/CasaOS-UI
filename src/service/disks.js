/*
 * @Author: JerryK
 * @Date: 2021-09-18 21:32:13
 * @LastEditors: Jerryk jerry@icewhale.org
 * @LastEditTime: 2022-08-03 14:23:16
 * @Description: Disk API
 * @FilePath: /CasaOS-UI/src/service/disks.js
 */
import { api } from "./service.js";
const PREFIX = "/disks";
const disks = {

    // get disk list
    getDiskList(data) {
        return api.get(`${PREFIX}`, data);
    },

    // Get usbs
    getUsbs(){
        return api.get(`${PREFIX}/usb`);
    }
}
export default disks;
