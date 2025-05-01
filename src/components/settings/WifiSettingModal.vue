<template>
	<div class="modal-card">
		<!-- Modal-Card Header Start -->
		<header class="modal-card-head">
			<div class="is-flex-grow-1">
				<h3 class="title is-header">{{ $t("WifiSettings") }}</h3>
			</div>
			<b-icon class="close-button" icon="close-outline" pack="casa" @click.native="$emit('close');" />
		</header>
		<!-- Modal-Card Header End -->
		<!-- Modal-Card Body Start -->
		<section class="modal-card-body ">
			<p class="sub-title">{{ $t("WifiCurrentStatus") }}</p>
			<b-notification type="is-info" v-if="isSwitching">
				{{ $t("WifiApplayMessage") }}
			</b-notification>
			<dl v-if="!isSwitching">
				<div>
					<dt>
						<b-icon class="mr-1 ml-1" icon="checkbox-multiple-blank-circle" pack="mdi" custom-size="20px" ></b-icon>
						{{ $t("WifiMode") }}
					</dt>
					<dd>
						{{ wifiStatus.mode === 'ap' ? $t('WifiModeAccessPoint') : $t('WifiModeClient') }}
						<span v-if="wifiStatus.mode === 'ap'">
							<p class="help is-info">{{ $t("WifiModeAccessPointDescription") }}</p>
						</span>
						<span v-else-if="wifiStatus.mode === 'client'">
							<p class="help is-info">{{ $t("WifiModeClientDescription") }}</p>
						</span>
					    <div v-else></div>
					</dd>
				</div>
				<div>
					<dt>
						<b-icon class="mr-1 ml-1" icon="wifi" pack="mdi" custom-size="20px" ></b-icon>
						SSID
					</dt>
					<dd>{{ wifiStatus.ssid }}</dd>
				</div>
				<div>
					<dt>
						<b-icon class="mr-1 ml-1" icon="web" pack="mdi" custom-size="20px" ></b-icon>
						IP
					</dt>
					<dd>{{ wifiStatus.ip_address }}</dd>
				</div>
			</dl>
			<hr />
			<p class="sub-title">{{ $t("WifiUpdateStatus") }}</p>
			<div class="field">
				<label class="label">{{ $t("WifiMode") }}</label>
				<div class="control">
				<label class="radio">
					<input type="radio" value="ap" v-model="selectedMode" />
					<b-icon class="ml-1 mr-1 pt-2 is-size-5" icon="access-point" pack="mdi" size="is-small" ></b-icon>
					{{ $t("WifiModeAccessPoint") }}
				</label>
				<label class="radio">
					<input type="radio" value="client" v-model="selectedMode" />
					<b-icon class="ml-1 mr-1 pt-1 is-size-6" icon="wifi" pack="mdi" size="is-small" ></b-icon>
					{{ $t("WifiModeClient") }}
				</label>
				</div>

				<p class="help is-info mt-2" v-if="selectedMode === 'ap'">
					{{ $t("WifiUpdateAccessPintDescription") }}
				</p>
				<p class="help is-info mt-2" v-else-if="selectedMode === 'client'">
					{{ $t("WifiUpdateWifiClientDescription") }}				
				</p>
			</div>
			<div v-if="selectedMode === 'client'">
				<b-field label="SSID">
				<b-input v-model="ssid" :placeholder="$t('WifiUpdateSSIDInput')" />
				</b-field>
				<b-field :label="$t('Password')">
				<b-input v-model="password" type="password" :placeholder="$t('WifiUpdatePasswordInput')" />
				</b-field>
			</div>
			<div class="node-card fixed-height">

			</div>
		</section>
		<!-- Modal-Card Body End -->
		<!-- Modal-Card Footer Start-->
		<footer class="modal-card-foot is-flex is-align-items-center">
			<div class="is-flex-grow-1"></div>
			<div>
				<b-button :label="$t('Cancel')" rounded @click="$emit('close')" />
				<b-button :label="$t('Apply')" :loading="isUpdating" expaned rounded type="is-primary"
						  @click="setupWiFi"/>
			</div>
		</footer>
		<!-- Modal-Card Footer End -->
	</div>
</template>

<script>
import {marked} from 'marked'

export default {
	props: {
		changeLog: {
			type: String,
			default: ""
		},
	},
	data() {
		return {
			timer: 0,
			updateTimer: 0,
			isUpdating: false,
			markdown: ``,
			updateLogs: ``,
			selectedMode: "ap",
			ssid: "",
			password: "",
			wifiStatus: {
				mode: null,
				ssid: "",
				ip_address: ""
			},
			isSwitching: false,
			wifiStatusPoller: null,
		};
	},
	mounted() {
		this.fetchWifiStatus().then(status => {
			this.selectedMode = status.mode;
			this.ssid = status.ssid;
		})
		this.wifiStatusPoller = setInterval(this.fetchWifiStatus, 5000);
	},
	computed: {
	},
	beforeDestroy() {
		clearInterval(this.wifiStatusPoller);
	},
	methods: {
		async setupWiFi() {
			try {
				this.isSwitching = true;
				let res = null;
				if ( this.selectedMode === 'ap'){
					res = await this.$api.wifi.setupAP();
				}else{
					res = await this.$api.wifi.setupWiFi({ mode: this.selectedMode, ssid: this.ssid, password: this.password });
				}
				this.showMessage("設定を送信しました。数秒後に接続されるまでお待ちください。")
			} catch (err) {
				this.isSwitching = false;
				this.showMessage("Wi-Fi設定に失敗しました。")
				console.error("❌ WiFisetup", err)
			}
			this.isUpdating = false;
		},
		showMessage(message) {
			this.$buefy.toast.open({
			message: message,
			type: 'is-info',
			duration: 5000,
			position: 'is-bottom',
			})
		},
		/**
		 * @description: get Wifi status
		 * @return {*} void
		 */
		async fetchWifiStatus () {
			try {
				const res = await this.$api.wifi.getWifiStatus();
				if (this.wifiStatus.mode !== null && res.data.mode !== this.wifiStatus.mode) {
					this.isSwitching = false;
					this.showMessage(`WiFiモードが「${res.data.mode}」に変わりました`);
				}
				this.wifiStatus = res.data;
				return res.data;
			} catch (err) {
				console.error("WiFiステータス取得失敗", err);
				console.error("❌ WiFi取得失敗", err)
			}
		},
	},
}
</script>

<style lang="scss">
.fixed-height {
	max-height: 20rem;
	overflow-y: auto;
}

.update-info-container {
	line-height: 1.5rem;
	border-radius: 4px;
	overflow: hidden;
	min-height: 20rem;

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		font-weight: bold;
		margin-bottom: 0.4rem;
	}

	h1 {
		font-size: 2em;
	}

	h2 {
		font-size: 1.5em;
	}

	h3 {
		font-size: 1.17em;
	}

	h4 {
		font-size: 1em;
	}

	h5 {
		font-size: 0.83em;
	}

	h6 {
		font-size: 0.67em;
	}

	ul {
		margin-bottom: 0.5em;

		li {
			list-style: disc;
			margin-left: 1rem;
		}
	}
}
.sub-title{
	font-weight: bold;
	margin-bottom: 0.2rem;
}
dl {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* 各行の間隔 */
}

dl > div {
  display: flex;
  gap: 0.5rem;
}

dt {
  min-width: 6rem; /* 固定幅でそろえる */
  font-weight: bold;
  margin: 0;
}

dd {
  margin: 0;
}

</style>
