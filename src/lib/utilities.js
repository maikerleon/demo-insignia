import Swal from 'sweetalert2';
import moment from 'moment';
import 'moment-timezone';

const getMonthNameInSpanish = (monthNumber) => {
    const monthsInSpanish = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ];
    return monthsInSpanish[monthNumber];
};

export const timesTampTz = (daysToAdd = 0) => {
    const d = moment().tz("America/Mexico_City").add(daysToAdd, 'days');
    const time = d.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    return time;
}

export const formatDateTime = (dateTime) => {
    const dateInMexico = moment(dateTime).tz('America/Mexico_City');
    const monthInSpanish = getMonthNameInSpanish(dateInMexico.month());
    const formattedDate = `${dateInMexico.date()} ${monthInSpanish} ${dateInMexico.year()} ${dateInMexico.format(
        'h:mm A'
    )}`;
    return formattedDate;
};

export const formatDate = (dateTime) => {
    const dateInMexico = moment(dateTime).tz('America/Mexico_City');
    const monthInSpanish = getMonthNameInSpanish(dateInMexico.month());
    const formattedDate = `${dateInMexico.date()} ${monthInSpanish} ${dateInMexico.year()}`;
    return formattedDate;
};

export const formatDateMonthAndYear = (dateTime) => {
    const dateInMexico = moment(dateTime).tz('America/Mexico_City');
    const monthInSpanish = getMonthNameInSpanish(dateInMexico.month());
    const formattedDate = `${monthInSpanish} ${dateInMexico.year()}`;
    return formattedDate;
};

export const formatDateSlash = (dateTime) => {
    const dateInMexico = moment(dateTime).tz('America/Mexico_City');
    const formattedDate = `${dateInMexico.month() + 1}/${dateInMexico.date()}/${dateInMexico.format('YY')}`;
    return formattedDate;
};

export const calculateTimeDifference = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const duration = moment.duration(end.diff(start));

    const days = duration.asDays();
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let timeDifference = '';

    if (years >= 1) {
        const remainingMonths = months % 12;
        timeDifference += `${years} año${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    } else if (months >= 1) {
        const remainingWeeks = weeks % 4;
        timeDifference += `${months} mes${months > 1 ? 'es' : ''} ${remainingWeeks > 0 ? `${remainingWeeks} semana${remainingWeeks > 1 ? 's' : ''}` : ''}`;
    } else if (weeks >= 1) {
        const remainingDays = days % 7;
        timeDifference += `${weeks} semana${weeks > 1 ? 's' : ''} ${remainingDays > 0 ? `${remainingDays} día${remainingDays > 1 ? 's' : ''}` : ''}`;
    } else {
        timeDifference += `${Math.floor(days)} día${days > 1 ? 's' : ''}`;
    }

    return timeDifference;
};


export const capitalizeString = str => {
    if (!str) return '';
  
    return str
      .trim()
      .replace(/\s+/g, ' ')
    //   .toLowerCase()
      .replace(/(^\w)/, firstChar => firstChar.toUpperCase());
};

export const uppercaseString = str => {
    if (!str) return '';
  
    return str
      .trim()
      .split(' ')
      .map(word => word.toUpperCase())
      .join(' ');
};

export const validateString = (value, allowNumbers, minLength, maxLength) => {
    const regex = allowNumbers ? /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s0-9"'.,;()-]+$/ : /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s"'.,;()-]+$/;

    return (
        value === '' ||
        value.length < minLength ||
        value.length > maxLength ||
        !regex.test(value)
    )
    ? false
    : true;
};

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validatePhoneNumber = ( value ) => {
    const regex = /^[0-9]{10}$/;
    return regex.test( value );
}

export const messageAlert = ( type, msg ) => {
    Swal.fire({
        icon: type,
        title: msg,
        showConfirmButton: false,
        timer: 2000
    })
}

export const handleLoading = (message = 'Cargando...') => {
    Swal.fire({
        title: typeof message === 'object' ? 'Cargando...' : message,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const messageForAdminView = () => {
    Swal.fire({
        icon: 'error',
        title: 'No puede realizar esta acción; su rol es solo de visualización.',
        showConfirmButton: false,
        timer: 3000
    })
}

export const closeAlert = () => {
    Swal.close();
}

export const validateCURP = curp => /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$/.test(curp);

export const isValidJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
}

export const adminStructure = () => {
    return {
        id: '',
        role: null,
        name: '',
        lastname_father: '',
        lastname_mother: '',
        email: '',
        phone: '',
        dependence: null,
        municipality: null,
        coordination: []
    }
}

export const dependenceStructure = () => {
    return {
        id: '',
        name: '',
        address: {
            street: '',
            number: '',
            cp: '',
            municipality: 0,
            coordinates: ''
        },
        phone: '',
        abbr: '',
        logo: ''
    } 
}

export const axisStructure = () => {
    return {
        id: '',
        name: '',
        objective: '',
        strategy: '',
        actions: {
            list: [{action: ''}]
        }
    } 
}

export const progressStructure = () => {
    return {
        id: '',
        files: [],
        general: "",
        percent: 0,
        need_approve: false,
        approval_details: "",
        approved: 'pending',
        files_approved: [],
        response: '',
        created_at: new Date().toISOString(),
        approved_at: '',
      }
}

export const approvalStructure = () => {
    return {
        id: '',
        need_approve: true,
        approval_details: "",
        approved: 'pending',
        files_approved: [],
        response: '',
        created_at: new Date().toISOString(),
        approved_at: '',
      }
}

export const subProjectStructure = () => {
    return {
        id: "",
        name: "",
        start: "",
        municipalities: [],
        percent: 0,
        description: "",
        status: null,
        invertion: 0,
        turn: '',
        employments: 0,
        origin: '',
        regions: null,
        climate: 0,
        rehabilitation: 0,
        equipment: 0
      }
}

export const socializationStructure = () => {
    return {
        id: '',
        strategy: '',
        links: [
            {
                link: '',
                description: ''
            }
        ],
        created_at: new Date().toISOString()
    }
}

export const projectStructure = () => {
    return {
        id: '',
        name: '',
        commitment: {data: null},
        start: '',
        end: '',
        axis: {data: null},
        theme: {data: null},
        type: null,
        regions: {data: null},
        secretaries: {data: null},
        municipalities: {data: null},
        dependence: {data: null},
        manager: {data: null},
        source: {list: [{source: null, type: '', amount: 0, beneficiaries: 0}]},
        indicators: {list: [{name: '', type_value: 'amount', value: 0, position: 0, source: ''}]},
        amount: 0,
        status: null,
        priority: null,
        objectives: {list: [{objective: ''}]},
        actions: {
            list: [{
                id: '', 
                name: '', 
                dependence: {data: null}, 
                start: '', 
                end: '', 
                type: 'action', 
                manager: {data: null}, 
                status: 'active'
            }]
        },
        transverse_axis: {data: null},
        background: '',
        aditional_information: '',
        description: '',
        strategic_project: false,
        strategy: '',
        beneficiaries: {list: [{ id: '', amount: null, group: null, group_age: null }] },
        have_address: false,
        address: '',
        duplicate: false,
        end_project: {
            date: '',
            type: '',
            evidence: [],
            location: {
                address: '',
                coordinates: ''
            },
            created_at: '',
            description: '',
            total_amount: 0,
            beneficiaries: []
        },
        rolesDirectory: '',
        supervision: false,
        executive_plan: 'partial',
        vobo: 'partial',
        right_way: 'no-apply',
        political_consideration: ''
    };
};

export const actionStructure = () => {
    return {
        id: '',
        name: '',
        dependence: {},
        start: '',
        end: '',
        project: '',
        level: '',
        father: '',
        manager: {},
        people: {},
        status: '',
        priority: '',
        comments: '',
        evidence: {data: []},
        actions: {list: [{id: '', name: '', dependence: {data: null}, start: '', end: '', type: 'action'}]}
    };
};

export const rolesDirectory = [
    {
        role: 'super-admin', 
        title: 'Administrador',
        who: ['super-admin', 'super-view']
    },
    {
        role: 'governor',
        title: 'Gobernador',
        who: ['super-admin']
    },
    {
        role: 'chief',
        title: 'Jefe de Gabinete',
        who: ['super-admin']
    },
    {
        role: 'supervisor',
        title: 'Supervisor',
        who: ['super-admin', 'super-view']
    },
    {
        role: 'super-view',
        title: 'Responsable de seguimiento',
        who: ['super-admin', 'super-view']
    },
    {
        role: 'dependence',
        title: 'Dependencia',
        who: ['super-admin', 'super-view']
    },
    {
        role: 'coordination',
        title: 'Coordinación',
        who: ['super-admin', 'super-view', 'dependence']
    },
    {
        role: 'municipality',
        title: 'Municipio',
        who: ['super-admin', 'super-view', 'dependence', 'coordination']
    },
    {
        role: 'register',
        title: 'Registrador',
        who: ['super-admin', 'super-view', 'dependence', 'coordination', 'municipality']
    }
];

export const canRegisterRole = (userRole, targetRole) => {
    const userRoleInfo = rolesDirectory.find(roleInfo => roleInfo.role === targetRole);
  
    if (!userRoleInfo) {
        return false;
    }
  
    return userRoleInfo.who.includes(userRole);
}

export const formatNumber = (number) => {
    return number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
};

export const formatAmount = (number) => {
    return number.toLocaleString('en-US');
};

export const formatDateString = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es', options).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$1/$2/$3');
};

export const formStyle = "block w-full px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring";
export const formStyleSelect = "block w-full px-4 pb-2 pt-2.5 text-gray-700 bg-white border border-gray-200 rounded-md focus:border-ins-700/30 focus:ring-ins-700 focus:ring-opacity-20 focus:outline-none focus:ring";