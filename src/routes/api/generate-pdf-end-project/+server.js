import { formatDate, formatNumber } from '$lib/utilities.js';
import { json } from '@sveltejs/kit';
import puppeteer from 'puppeteer';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    const dataSee_temp = data.get('dataSee');
    const dataSee = JSON.parse(dataSee_temp);


    const contenidoHTML = generarContenidoHTML(dataSee);

    const pdfBuffer = await generarPDF(contenidoHTML);

    
    return json(
        { 
            pdfBuffer: pdfBuffer.toString('base64'),
        }
    );
}

const generarContenidoHTML = (dataSee) => {
    let typeEnd = [
        {
            label: 'Evento',
            value: 'event'
        },
        {
            label: 'Entrega',
            value: 'delivery'
        },
        {
            label: 'Otro',
            value: 'other'
        }
    ];

    let beneficiaries = '';
    if( dataSee.end_project.beneficiaries && dataSee.end_project.beneficiaries.length > 0) {
        dataSee.end_project.beneficiaries.forEach(b => {
            beneficiaries += `
                <div>
                    <h4 style="font-size: 1.125rem;font-weight: 600;"># Beneficiarios</h4>
                    <span>${b.amount}</span>
                </div>
                <div>
                    <h4 style="font-size: 1.125rem;font-weight: 600;">Grupo</h4>
                    <span>${b.group.label}</span>
                </div>
            `;
        });
    }
    let indicators = '';
    if( dataSee.indicators.list && dataSee.indicators.list.length > 0) {
        dataSee.indicators.list.forEach(i => {
            indicators += `
                <div>
                    <h4 style="font-size: 1.125rem;font-weight: 600;">Nombre</h4>
                    <span>${i.name || 'Sin nombre'}</span>
                </div>
                <div>
                    <h4 style="font-size: 1.125rem;font-weight: 600;">Fuente</h4>
                    <span>${i.source || 'Sin fuente'}</span>
                </div>
                <div>
                    <h4 style="font-size: 1.125rem;font-weight: 600;">Valor de cierre</h4>
                    <span>${i.value || 'Sin valor'}</span>
                </div>
            `;
        });
    }
    const contenidoHTML = `
        <div style="font-family: sans-serif; padding: 20px">
            <h1 style="font-size: 1.875rem;text-align: center;font-weight: 700;">CIERRE DE PROYECTO</h1>
            <h2 style="font-size: 1.35rem;text-align: center;font-weight: 700;">${dataSee.name}</h2>
            <div style="margin-top: 5rem;">
                <div style="margin-bottom: 2rem;display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                    <div>
                        <h4 style="font-size: 1.125rem;font-weight: 600;">Fecha</h4>
                        <span>${dataSee.end_project.date ? formatDate(dataSee.end_project.date) : 'Sin fecha'}</span>
                    </div>
                    <div>
                        <h4 style="font-size: 1.125rem;font-weight: 600;">Tipo de cierre</h4>
                        <span>${typeEnd.find(t => t.value === dataSee.end_project.type)?.label || 'Sin tipo'}</span>
                    </div>
                    <div>
                        <h4 style="font-size: 1.125rem;font-weight: 600;">Inversión total</h4>
                        <span>${formatNumber(dataSee.end_project.total_amount)}</span>
                    </div>
                </div>
                <div style="margin-bottom: 2rem;width: 100%;">
                    <h3 style="font-size: 1.125rem;font-weight: 600;margin-bottom: 0.5rem;">Descripción</h3>
                    <span>${dataSee.end_project.description}</span>
                </div>
                <div style="margin-bottom: 2rem;width: 100%;">
                    <h3 style="font-size: 1.125rem;font-weight: 600;margin-bottom: 0.5rem;">Beneficiarios finales</h3>
                    <div style="display: grid;grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 0.5rem;">
                        ${beneficiaries}
                    </div>
                </div>
                <div style="margin-bottom: 2rem;width: 100%;">
                    <h3 style="font-size: 1.125rem;font-weight: 600;margin-bottom: 0.5rem;">Indicadores de impacto</h3>
                    <div style="display: grid;grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 0.5rem;">
                        ${indicators}
                    </div>
                </div>

                <div style="margin-bottom: 2rem;display: grid;grid-template-columns: repeat(3, minmax(0, 1fr));">
                    <div style="grid-column: span 2;">
                        <h4 style="font-size: 1.125rem;font-weight: 600;">Dirección</h4>
                        <span>${dataSee.end_project.location.address}</span>
                    </div>
                    <div>
                        <h4 style="font-size: 1.125rem;font-weight: 600;">Coordenadas</h4>
                        <span>${dataSee.end_project.location.coordinates}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    return contenidoHTML;
}

const generarPDF = async (htmlContent) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
}