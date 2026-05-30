import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue"

const loadApexCharts = () => {
	if (typeof window === "undefined") return Promise.resolve(null)
	if ((window as any).ApexCharts) return Promise.resolve((window as any).ApexCharts)

	return new Promise((resolve, reject) => {
		const existing = document.getElementById("apexcharts-cdn") as HTMLScriptElement | null

		if (existing) {
			existing.addEventListener("load", () => resolve((window as any).ApexCharts), { once: true })
			existing.addEventListener("error", reject, { once: true })
			return
		}

		const script = document.createElement("script")
		script.id = "apexcharts-cdn"
		script.src = "https://cdn.jsdelivr.net/npm/apexcharts"
		script.async = true
		script.onload = () => resolve((window as any).ApexCharts)
		script.onerror = reject
		document.head.appendChild(script)
	})
}

const ApexChart = defineComponent({
	name: "ApexChart",
	props: {
		type: { type: String, default: "line" },
		series: { type: Array, default: () => [] },
		options: { type: Object, default: () => ({}) },
		height: { type: [String, Number], default: 320 },
	},
	setup(props) {
		const root = ref<HTMLElement | null>(null)
		let chart: any = null

		const renderChart = async () => {
			if (!root.value) return
			const ApexCharts = await loadApexCharts()
			if (!ApexCharts) return

			if (chart) {
				await chart.updateOptions({ ...props.options, chart: { ...(props.options as any)?.chart, type: props.type } }, false, true)
				await chart.updateSeries(props.series, true)
				return
			}

			chart = new ApexCharts(root.value, {
				...props.options,
				chart: { ...(props.options as any)?.chart, type: props.type },
				series: props.series,
				height: props.height,
			})
			await chart.render()
		}

		onMounted(renderChart)
		watch(() => [props.type, props.series, props.options, props.height], renderChart, { deep: true })
		onBeforeUnmount(() => {
			if (chart) chart.destroy()
			chart = null
		})

		return () => h("div", { ref: root })
	},
})

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.component("ApexChart", ApexChart)
})
