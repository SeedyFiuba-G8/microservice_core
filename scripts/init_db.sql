-- Drop pre-existent dbs
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.reviewers;
DROP TABLE IF EXISTS public.project_hashes;
DROP TABLE IF EXISTS public.stages;
DROP TABLE IF EXISTS public.projects;

-- Create tables
CREATE TABLE public.projects (
	-- Name				Type
	id					VARCHAR(36)					NOT NULL	PRIMARY KEY,
	status				VARCHAR(20)					NOT NULL	DEFAULT 'DRAFT',
	user_id				VARCHAR(36)					NOT NULL,
	reviewer_id			VARCHAR(36),
	title				VARCHAR(100)				NOT NULL,
	description			VARCHAR(255)				NOT NULL,
	cover_pic_url		VARCHAR(255),
	type				VARCHAR(20)					NOT NULL,
	objective			VARCHAR(255)				NOT NULL,
	country				VARCHAR(20)					NOT NULL,
	city				VARCHAR(20)					NOT NULL,
	published_on		TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2),
	finalized_by		TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2),
	tags				VARCHAR(20) ARRAY[12]		NOT NULL    DEFAULT '{}'
);

CREATE TABLE public.reviewers (
	project_id			VARCHAR(36)					NOT NULL,
	reviewer_id			VARCHAR(36)					NOT NULL,
	status				VARCHAR(20)					NOT NULL,

    PRIMARY KEY (project_id, reviewer_id)
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

CREATE TABLE public.wallets (
	user_id				VARCHAR(36)					NOT NULL		 PRIMARY KEY,
	wallet_id			VARCHAR(36)					NOT NULL
);

CREATE TABLE public.stages (
	project_id			VARCHAR(36)			NOT NULL	REFERENCES public.projects (id) ON DELETE RESTRICT,
	stage						INTEGER					NOT NULL	DEFAULT 0,
	cost						NUMERIC					NOT NULL,
	description			VARCHAR(255)		NOT NULL,
	PRIMARY KEY (project_id, stage)
);

CREATE TABLE public.project_hashes (
	project_id 	VARCHAR(36)			NOT NULL 	PRIMARY KEY 	REFERENCES public.projects (id) ON DELETE RESTRICT,
	tx_hash			VARCHAR(128)		NOT NULL	UNIQUE
);

-- Insert values
-- INSERT INTO public.projects(
-- 	id, status, user_id, title, description, type, objective, country, city, tags)
-- 	VALUES
-- 	(
-- 		'123e4567-e89b-12d3-a456-426614174001',
-- 		'DRAFT',
-- 		'ca718a21-a126-484f-bc50-145126a6f75b',
-- 		'Titulo 1',
-- 		'Descripcion 1',
-- 		'social',
-- 		'Objetivo 1',
-- 		'Argentina',
-- 		'Buenos Aires',
--         ARRAY [ 'javascript', 'python' ]
-- 	);

-- INSERT INTO public.projects(
-- 	id, status, user_id, title, description, type, objective, country, city)
-- 	VALUES
-- 	(
-- 		'9bb37345-41ad-471e-adc3-980fd05e5b63',
-- 		'DRAFT',
-- 		'ca718a21-a126-484f-bc50-145126a6f76b',
-- 		'Titulo 2',
-- 		'Descripcion 2',
-- 		'education',
-- 		'Objetivo 2',
-- 		'Argentina',
-- 		'Buenos Aires'
-- 	);

-- INSERT INTO public.tags(
--     tag, project_id
--     )
-- 	VALUES
-- 	(
-- 		'javascript',
--         '123e4567-e89b-12d3-a456-426614174001'
-- 	),
--     (
-- 		'python',
--         '123e4567-e89b-12d3-a456-426614174001'
-- 	);
