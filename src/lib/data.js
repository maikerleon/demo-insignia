export const municipalities = [
    {
        name: "Abasolo",
        id: 1
    },
    {
        name: "Acuña",
        id: 2
    },
    {
        name: "Allende",
        id: 3
    },
    {
        name: "Arteaga",
        id: 4
    },
    {
        name: "Candela",
        id: 5
    },
    {
        name: "Castaños",
        id: 6
    },
    {
        name: "Cuatro Ciénegas",
        id: 7
    },
    {
        name: "Escobedo",
        id: 8
    },
    {
        name: "Francisco I. Madero",
        id: 9
    },
    {
        name: "Frontera",
        id: 10
    },
    {
        name: "General Cepeda",
        id: 11
    },
    {
        name: "Guerrero",
        id: 12
    },
    {
        name: "Hidalgo",
        id: 13
    },
    {
        name: "Jiménez",
        id: 14
    },
    {
        name: "Juárez",
        id: 15
    },
    {
        name: "Lamadrid",
        id: 16
    },
    {
        name: "Matamoros",
        id: 17
    },
    {
        name: "Monclova",
        id: 18
    },
    {
        name: "Morelos",
        id: 19
    },
    {
        name: "Múzquiz",
        id: 20
    },
    {
        name: "Nadadores",
        id: 21
    },
    {
        name: "Nava",
        id: 22
    },
    {
        name: "Ocampo",
        id: 23
    },
    {
        name: "Parras",
        id: 24
    },
    {
        name: "Piedras Negras",
        id: 25
    },
    {
        name: "Progreso",
        id: 26
    },
    {
        name: "Ramos Arizpe",
        id: 27
    },
    {
        name: "Sabinas",
        id: 28
    },
    {
        name: "Sacramento",
        id: 29
    },
    {
        name: "Saltillo",
        id: 30
    },
    {
        name: "San Buenaventura",
        id: 31
    },
    {
        name: "San Juan de Sabinas",
        id: 32
    },
    {
        name: "San Pedro",
        id: 33
    },
    {
        name: "Sierra Mojada",
        id: 34
    },
    {
        name: "Torreón",
        id: 35
    },
    {
        name: "Viesca",
        id: 36
    },
    {
        name: "Villa Unión",
        id: 37
    },
    {
        name: "Zaragoza",
        id: 38
    }
];

export const impact = [
    {
        label: "Estatal",
        value: 'state'
    },
    {
        label: "Federal",
        value: 'federal'
    },
    {
        label: "Municipal",
        value: 'municipal'
    }
];

export const actions_types = [
    {
        label: "Acción general",
        value: 'action'
    },
    {
        label: "Evento",
        value: 'event'
    },
    {
        label: "Evento arranque",
        value: 'event-start'
    },
    {
        label: "Supervisión",
        value: 'supervision'
    },
    {
        label: "Permanente",
        value: 'permanent'
    },
    {
        label: "Desdoble",
        value: 'split'
    }
];

export const priorities = [
    {
        label: "Baja",
        value: 'low',
        color: 'bg-green-600',
        color_hex: '#13753f',
        text_color: 'white'
    },
    {
        label: "Media",
        value: 'medium',
        color: 'bg-yellow-500',
        color_hex: '#f6bf25',
        text_color: 'black'
    },
    {
        label: "Alta",
        value: 'high',
        color: 'bg-red-600',
        color_hex: '#d50001',
        text_color: 'white'
    }
];

export const statusByOrder = ['finished', 'active-process', 'not-activated', 'approved-waiting', 'waiting-approval'];

export const statutes = [
    {
        label: "Activo en proceso",
        value: 'active-process',
        color: 'bg-yellow-500',
        color_hex: '#f6bf25'
    },
    {
        label: "Finalizado",
        value: 'finished',
        color: 'bg-green-600',
        color_hex: '#13753f'
    },
    {
        label: "No activado", 
        value: 'not-activated',
        color: 'bg-red-600',
        color_hex: '#d50001'
    },
    {
        label: "Aprobado y en espera",
        value: 'approved-waiting',
        color: 'bg-purple-500',
        color_hex: '#6f42c1'
    },
    {
        label: "En espera de aprobación",
        value: 'waiting-approval',
        color: 'bg-gray-500',
        color_hex: '#6c757d'
    }
];

export const commitments = [
    {
        label: "Coahuila Blindado",
        value: "coahuila-blindado"
    },
    {
        label: "Coahuila Global",
        value: "coahuila-global"
    },
    {
        label: "Salud Popular",
        value: "salud-popular"
    },
    {
        label: "Gobierno ciudadano",
        value: "gobierno-ciudadano"
    },
    {
        label: "Educación, presente y futuro",
        value: "educacion-presente-y-futuro"
    },
    {
        label: "Gobernador de las mujeres",
        value: "gobernador-de-las-mujeres"
    },
    {
        label: "Jóvenes Pa’delante",
        value: "jovenes-pa-delante"
    },
    {
        label: "Medio ambiente y el campo",
        value: "medio-ambiente-y-el-campo"
    },
    {
        label: "Municipios de calidad",
        value: "municipios-de-calidad"
    }
];

export const themes = [
    {
        label: "Agua",
        value: "agua"
    },
    {
        label: "Bicentenario",
        value: "bicentenario"
    },
    {
        label: "Campo",
        value: "campo"
    },
    {
        label: "Con obras sociales a pasos de gigante",
        value: "con-obras-sociales-a-pasos-de-gigante"
    },
    {
        label: "Cultura",
        value: "cultura"
    },
    {
        label: "Deportes",
        value: "deportes"
    },
    {
        label: "DIF",
        value: "dif"
    },
    {
        label: "Drenaje",
        value: "drenaje"
    },
    {
        label: "Economía",
        value: "economia"
    },
    {
        label: "Educación",
        value: "educacion"
    },
    {
        label: "Empleo",
        value: "empleo"
    },
    {
        label: "Infraestructura",
        value: "infraestructura"
    },
    {
        label: "Inspira",
        value: "inspira"
    },
    {
        label: "ISN .2",
        value: "isn .2"
    },
    {
        label: "ISN .8",
        value: "isn .8"
    },
    {
        label: "Jóvenes",
        value: "jovenes"
    },
    {
        label: "Medio ambiente",
        value: "medio-ambiente"
    },
    {
        label: "Mejora",
        value: "mejora"
    },
    {
        label: "Mujeres",
        value: "mujeres"
    },
    {
        label: "Obra social Mejora",
        value: "obra-social-mejora"
    },
    {
        label: "Obras Insignia",
        value: "obras-insignia"
    },
    {
        label: "Pavimentación",
        value: "pavimentacion"
    },
    {
        label: "PRO COAHUILA",
        value: "pro-coahuila"
    },
    {
        label: "Programas sociales",
        value: "programas-sociales"
    },
    {
        label: "Recarpeto",
        value: "recarpeto"
    },
    {
        label: "Salud",
        value: "salud"
    },
    {
        label: "Seguridad",
        value: "seguridad"
    },
    {
        label: "Turismo",
        value: "turismo"
    }
];

export const transverse_axis = [
    {
        label: "Mejora Coahuila",
        value: "mejora-coahuila"
    },
    {
        label: "Estrategia Integral para las Mujeres",
        value: "estrategia-integral-para-las-mujeres"
    },
    {
        label: "Inspira",
        value: "inspira"
    },
    {
        label: "Pro Coahuila",
        value: "pro-coahuila"
    }
];

export const types = [
    {
        label: "100 días",
        value: "100-days"
    },
    {
        label: "Proyectos",
        value: "projects"
    }
];

export const poblations = [
    {
        label: "Adultos mayores",
        value: "adultos-mayores"
    },
    {
        label: "Mujeres",
        value: "mujeres"
    },
    {
        label: "Jóvenes",
        value: "jovenes"
    },
    {
        label: "Niñas y niños",
        value: "ninas-y-ninos"
    },
    {
        label: "Familias",
        value: "familias"
    },
    {
        label: "Población en general",
        value: "poblacion-en-general"
    },
    {
        label: "Personas con discapacidad",
        value: "personas-con-discapacidad"
    },
    {
        label: "Estructura",
        value: "estructura"
    },
    {
        label: "Productores agrícolas y ganaderos",
        value: "productores-agricolas-y-ganaderos"
    }
];

export const poblations_age = [
    {
        label: "0 - 4 años",
        value: "0-4"
    },
    {
        label: "5 - 11 años",
        value: "5-11"
    },
    {
        label: "12 - 17 años",
        value: "12-17"
    },
    {
        label: "18 - 32 años",
        value: "18-32"
    },
    {
        label: "33 - 59 años",
        value: "33-59"
    },
    {
        label: "60 años y más",
        value: "60-plus"
    },
    {
        label: "Todas las edades",
        value: "all"
    }
];

export const regions = [
    {
        label: "Carbonífera",
        value: "carbonifera",
        municipalities: [15, 26, 28, 32, 20]
    },
    {
        label: "Centro Desierto",
        value: "centro-desierto",
        municipalities: [6, 10, 8, 18, 1, 5, 7, 29, 21, 16, 31, 23]
    },
    {
        label: "Laguna",
        value: "laguna",
        municipalities: [9, 17, 33, 34, 35, 36]
    },
    {
        label: "Norte",
        value: "norte",
        municipalities: [2, 14, 3, 19, 22, 37, 38, 12, 25, 13]
    },
    {
        label: "Sureste",
        value: "sureste",
        municipalities: [4, 11, 24, 27, 30]
    }
];

export const sources = [
    {
        label: "Federal",
        value: "federal"
    },
    {
        label: "Estatal",
        value: "state"
    },
    {
        label: "Municipal",
        value: "municipal"
    },
    {
        label: "IP",
        value: "ip"
    },
    {
        label: "ISN",
        value: "isn"
    }
];