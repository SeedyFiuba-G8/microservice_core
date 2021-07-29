-- Drop pre-existent dbs
DROP TABLE IF EXISTS public.notification_tokens;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.ratings;
DROP TABLE IF EXISTS public.reviewers;
DROP TABLE IF EXISTS public.project_hashes;
DROP TABLE IF EXISTS public.stages;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.events;

-- Create tables
CREATE TABLE public.projects (
	-- Name				Type
	id					VARCHAR(36)					NOT NULL	PRIMARY KEY,
	status				VARCHAR(20)					NOT NULL	DEFAULT 'DRAFT',
	blocked				BOOLEAN						NOT NULL	DEFAULT FALSE,
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
	tags				VARCHAR(20) ARRAY[12]		NOT NULL 	DEFAULT '{}'
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

CREATE TABLE public.likes (
	project_id			VARCHAR(36)					NOT NULL,
	user_id				VARCHAR(36)					NOT NULL,

    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project
      FOREIGN KEY(project_id) 
	  REFERENCES public.projects(id)
      ON DELETE CASCADE
);

CREATE TABLE public.ratings (
	project_id			VARCHAR(36)			NOT NULL,
	user_id				VARCHAR(36)			NOT NULL,
	rating				INTEGER				NOT NULL	CHECK (rating > 0 and rating <= 5),

    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project
      FOREIGN KEY(project_id) 
	  REFERENCES public.projects(id)
      ON DELETE CASCADE
);

CREATE TABLE public.wallets (
	user_id							VARCHAR(36)					NOT NULL		 PRIMARY KEY,
	wallet_id						VARCHAR(36)					NOT NULL
);

CREATE TABLE public.notification_tokens (
	user_id							VARCHAR(36)					NOT NULL,
	token 							VARCHAR(255)				NOT NULL,
	PRIMARY KEY (user_id, token)
);

CREATE TABLE public.stages (
	project_id			VARCHAR(36)			NOT NULL	REFERENCES public.projects (id) ON DELETE RESTRICT,
	stage				INTEGER				NOT NULL	DEFAULT 0,
	cost				NUMERIC				NOT NULL,
	description			VARCHAR(255)		NOT NULL,

	PRIMARY KEY (project_id, stage)
);

CREATE TABLE public.project_hashes (
	project_id 		VARCHAR(36)			NOT NULL 	PRIMARY KEY 	REFERENCES public.projects (id) ON DELETE RESTRICT,
	tx_hash			VARCHAR(128)		NOT NULL	UNIQUE
);

CREATE TABLE public.events (
	-- Name				Type
	date				TIMESTAMP WITH TIME ZONE	NOT NULL	DEFAULT CURRENT_TIMESTAMP(2),
	event				VARCHAR(20)					NOT NULL,
	user_id				VARCHAR(36)			
);
