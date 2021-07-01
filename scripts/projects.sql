-- Create user table

DROP TABLE IF EXISTS public.projects;

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
	finalized_by		TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2)
);
