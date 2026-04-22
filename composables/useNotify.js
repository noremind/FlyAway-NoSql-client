export const useNotify = () => {
	const items = useState("ui-notifications", () => []);

	const remove = (id) => {
		items.value = items.value.filter((item) => item.id !== id);
	};

	const push = ({
		title = "",
		text = "",
		status = "info",
		duration = 3200,
	} = {}) => {
		const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

		items.value = [
			...items.value,
			{
				id,
				title,
				text,
				status,
			},
		];

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	};

	const success = (payload) =>
		push({
			status: "success",
			...(typeof payload === "string" ? { text: payload } : payload),
		});

	const error = (payload) =>
		push({
			status: "error",
			duration: 4500,
			...(typeof payload === "string" ? { text: payload } : payload),
		});

	const info = (payload) =>
		push({
			status: "info",
			...(typeof payload === "string" ? { text: payload } : payload),
		});

	const warning = (payload) =>
		push({
			status: "warning",
			...(typeof payload === "string" ? { text: payload } : payload),
		});

	return {
		items,
		push,
		remove,
		success,
		error,
		info,
		warning,
	};
};