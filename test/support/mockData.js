module.exports = function $mockData() {
  const postProject = {
    title: 'Titulo 1',
    description: 'Descripcion de proyecto',
    coverPicUrl: 'https://imgur.com/gallery/rFvivtw',
    type: 'social',
    objective: 'Objetivo de proyecto',
    lat: 38.8951,
    long: 38.8951,
    finalizedBy: '2022-06-13T21:29:29.330Z',
    tags: ['javascript', 'python', 'food'],
    reviewers: ['123e4567-e89b-12d3-a456-426614174000'],
    stages: [
      {
        cost: 0.000001,
        description: 'In this stage, we will buy the equipment.'
      },
      {
        cost: 0.002,
        description: 'In this stage, we will prepare everything'
      }
    ]
  };
  const projects = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      status: 'DRAFT',
      blocked: false,
      liked: false,
      title: 'Titulo 1',
      description: 'Descripcion de proyecto',
      objective: 'Objetivo del proyecto',
      coverPicUrl: 'https://imgur.com/gallery/rFvivtw',
      type: 'social',
      lat: 38.8951,
      long: 38.8951,
      city: 'Buenos Aires',
      finalizedBy: '2022-06-13T21:29:29.330Z',
      tags: ['javascript', 'python', 'food'],
      reviewers: ['123e4567-e89b-12d3-a456-426614174000'],
      stages: [
        {
          cost: 0.000001,
          description: 'In this stage, we will buy the equipment.'
        },
        {
          cost: 0.002,
          description: 'In this stage, we will prepare everything'
        }
      ],
      totalFunded: 0.000001,
      currentStage: 1,
      contributors: 2,
      contributions: 5
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      status: 'DRAFT',
      blocked: false,
      liked: false,
      title: 'Titulo 2',
      description: 'Descripcion de proyecto',
      coverPicUrl: 'https://imgur.com/gallery/rFvivtw',
      type: 'social',
      objective: 'Objetivo de proyecto',
      lat: 38.8951,
      long: 38.8951,
      finalizedBy: '2023-06-13T21:29:29.330Z',
      tags: ['javascript', 'food'],
      reviewers: [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001'
      ],
      stages: [
        {
          cost: 0.003,
          description: 'In this stage, we will buy the equipment.'
        },
        {
          cost: 0.004,
          description: 'In this stage, we will do..'
        },
        {
          cost: 0.008,
          description: 'In this stage, we will prepare..'
        }
      ],
      totalFunded: 0.000001,
      currentStage: 1,
      contributors: 2,
      contributions: 5
    }
  ];

  return { projects, postProject };
};
