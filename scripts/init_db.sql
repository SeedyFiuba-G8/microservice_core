-- Drop pre-existent dbs
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.projects;

-- Create tables
CREATE TABLE public.projects (
	-- Name				Type
	id					VARCHAR(36)					NOT NULL	PRIMARY KEY,
	user_id				VARCHAR(36)					NOT NULL,
	title				VARCHAR(100)				NOT NULL,
	description			VARCHAR(255)				NOT NULL,
	type				VARCHAR(20)					NOT NULL,
	objective			VARCHAR(255)				NOT NULL,
	country				VARCHAR(20)					NOT NULL,
	city				VARCHAR(20)					NOT NULL,
	published_on		TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2),
	finalized_by		TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2),
	tags				VARCHAR(20) ARRAY[12]		NOT NULL    DEFAULT '{}'
);

CREATE TABLE public.tags (
	tag					VARCHAR(20)					NOT NULL,
	project_id			VARCHAR(36)					NOT NULL,

    PRIMARY KEY (tag, project_id),
    CONSTRAINT fk_project
      FOREIGN KEY(project_id) 
	  REFERENCES public.projects(id)
      ON DELETE CASCADE
);

-- Insert values
INSERT INTO public.projects(
	id, user_id, title, description, type, objective, country, city, tags)
	VALUES
	(
		'123e4567-e89b-12d3-a456-426614174001',
		'ca718a21-a126-484f-bc50-145126a6f75b',
		'Titulo 1',
		'Descripcion 1',
		'social',
		'Objetivo 1',
		'Argentina',
		'Buenos Aires',
        ARRAY [ 'javascript', 'python' ]
	);

INSERT INTO public.projects(
	id, user_id, title, description, type, objective, country, city)
	VALUES
	(
		'9bb37345-41ad-471e-adc3-980fd05e5b63',
		'ca718a21-a126-484f-bc50-145126a6f76b',
		'Titulo 2',
		'Descripcion 2',
		'education',
		'Objetivo 2',
		'Argentina',
		'Buenos Aires'
	);

INSERT INTO public.tags(
    tag, project_id
    )
	VALUES
	(
		'javascript',
        '123e4567-e89b-12d3-a456-426614174001'
	),
    (
		'python',
        '123e4567-e89b-12d3-a456-426614174001'
	);