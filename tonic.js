require('doodad-js').createRoot()
	.then(root => {
		return root.Doodad.Modules.load([
			{
				module: 'doodad-js-dates'
			}
		]);
	})
	.then(root => {
		const dates = root.Doodad.Tools.Dates;
		console.log( dates.strftime("%c", new Date()) );
	})
	.catch(err => {
		console.error(err);
	});