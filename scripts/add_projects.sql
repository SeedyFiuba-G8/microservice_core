-- Add user example

INSERT INTO public.projects(
	id, user_id, title, description, type, objective, country, city)
	VALUES
	(
		'123e4567-e89b-12d3-a456-426614174001',
		'ca718a21-a126-484f-bc50-145126a6f75b',
		'Titulo 1',
		'Descripcion 1',
		'social',
		'Objetivo 1',
		'Argentina',
		'Buenos Aires'
	),
	(
		'9bb37345-41ad-471e-adc3-980fd05e5b63',
		'ca718a21-a126-484f-bc50-145126a6f75b',
		'Titulo 2',
		'Descripcion 2',
		'education',
		'Objetivo 2',
		'Argentina',
		'Buenos Aires'
	);