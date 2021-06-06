-- Add user example

INSERT INTO public.projects(
	id, title, description, type, objective, country, city)
	VALUES
	(
		'123e4567-e89b-12d3-a456-426614174001',
		'Prohibir la utilizacion de Winbugs globalmente',
		'No puede ser que haya gente que use Winbugs',
		'social',
		'Salvar a la gente de esta maldicion',
		'Argentina',
		'Buenos Aires'
	),
	(
		'9bb37345-41ad-471e-adc3-980fd05e5b63',
		'Que vuelva la presencialidad loco',
		'Extraniamos FIUBA',
		'education',
		'Retomar las tardes de trucos y mates',
		'Argentina',
		'Buenos Aires'
	);