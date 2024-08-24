<script>
	import { handleLoading, messageAlert, formatDate } from '$lib/utilities.js';
	import DownloadIcon from '$icons/DownloadIcon.svelte';
	import ButtonLight from '$components/ButtonLight.svelte';
    import JSZip from 'jszip';
    import ExcelJS from 'exceljs';

    export let dataSee;

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

    const generateExcel = async () => {

        const hexToArgb = (hex) => {
            return 'FF' + hex.slice(1);
        };

        try {
            const templateResponse = await fetch('/template-end-project.xlsx');
            if (!templateResponse.ok) {
                throw new Error('No se pudo obtener la plantilla');
            }
            const arrayBuffer = await templateResponse.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);
            worksheet.getRow(5).getCell(1).value = dataSee.end_project.date ? formatDate(dataSee.end_project.date) : 'Sin fecha';
            worksheet.getRow(5).getCell(3).value = typeEnd.find(t => t.value === dataSee.end_project.type)?.label || 'Sin tipo';
            worksheet.getRow(5).getCell(5).value = Number(dataSee.end_project.total_amount) || 0;
            worksheet.getRow(8).getCell(1).value = dataSee.end_project.description || 'Sin descripción';
            
            const styles = {
                font: { bold: true, size: 12 },
                alignment: { horizontal: 'center', vertical: 'middle' },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: hexToArgb('#57d7e1') }
                },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            };

            worksheet.mergeCells('A10:E10');
            const cell_10_1 = worksheet.getRow(10).getCell(1);
            cell_10_1.value = 'Beneficiarios finales';
            cell_10_1.alignment = styles.alignment;
            cell_10_1.font = styles.font;
            worksheet.getRow(10).height = 30;
            worksheet.getCell('A10').fill = styles.fill;

            worksheet.mergeCells('A12:B12');
            const cell_12_1 = worksheet.getRow(12).getCell(1);
            cell_12_1.alignment = styles.alignment;
            cell_12_1.font = styles.font;
            cell_12_1.value = '# Beneficiarios';

            worksheet.mergeCells('D12:E12');
            const cell_12_4 = worksheet.getRow(12).getCell(4);
            cell_12_4.alignment = styles.alignment;
            cell_12_4.font = styles.font;
            cell_12_4.value = 'Grupo';

            worksheet.getRow(12).height = 30;

            let rowView = 13;

            if (dataSee.end_project.beneficiaries.length > 0) {
                dataSee.end_project.beneficiaries.forEach(b => {
                    worksheet.mergeCells(`A${rowView}:B${rowView}`);
                    const cell_b1 = worksheet.getRow(rowView).getCell(1);
                    cell_b1.value = Number(b.amount) || 0;
                    cell_b1.alignment = styles.alignment;

                    worksheet.mergeCells(`D${rowView}:E${rowView}`);
                    const cell_b4 = worksheet.getRow(rowView).getCell(4);
                    cell_b4.value = b.group?.label || 'Sin grupo';
                    cell_b4.alignment = styles.alignment;

                    worksheet.getRow(rowView).height = 20;
                    rowView++;
            });
            } else {
                worksheet.mergeCells(`A${rowView}:E${rowView}`);
                const cell_no_beneficiaries = worksheet.getRow(rowView).getCell(1);
                cell_no_beneficiaries.value = 'Sin beneficiarios';
                cell_no_beneficiaries.alignment = { horizontal: 'center', vertical: 'middle' };
                worksheet.getRow(rowView).height = 20;
                rowView++;
            }

            rowView += 2;

            worksheet.mergeCells(`A${rowView}:E${rowView}`);
            const cell_beneficiaries_title = worksheet.getRow(rowView).getCell(1);
            cell_beneficiaries_title.value = 'Indicadores de impacto';
            cell_beneficiaries_title.alignment = styles.alignment;
            cell_beneficiaries_title.font = styles.font;
            worksheet.getRow(rowView).height = 30;

            rowView += 2;

            const cell_before_beneficiaries_subtitle_1 = worksheet.getRow(rowView).getCell(1);
            cell_before_beneficiaries_subtitle_1.value = 'Nombre';
            cell_before_beneficiaries_subtitle_1.alignment = styles.alignment;
            cell_before_beneficiaries_subtitle_1.font = styles.font;

            const cell_beneficiaries_subtitle_2 = worksheet.getRow(rowView).getCell(3);
            cell_beneficiaries_subtitle_2.value = 'Fuente';
            cell_beneficiaries_subtitle_2.alignment = styles.alignment;
            cell_beneficiaries_subtitle_2.font = styles.font;

            const cell_beneficiaries_subtitle_3 = worksheet.getRow(rowView).getCell(5);
            cell_beneficiaries_subtitle_3.value = 'Valor de cierre';
            cell_beneficiaries_subtitle_3.alignment = styles.alignment;
            cell_beneficiaries_subtitle_3.font = styles.font;

            rowView++;

            if ( dataSee.indicators.list.length > 0 ) {
                dataSee.indicators.list.forEach(i => {
                    worksheet.getRow(rowView).getCell(1).value = i.name || 'Sin nombre';
                    worksheet.getRow(rowView).getCell(1).alignment = styles.alignment;

                    worksheet.getRow(rowView).getCell(3).value = i.source || 'Sin fuente';
                    worksheet.getRow(rowView).getCell(3).alignment = styles.alignment;

                    worksheet.getRow(rowView).getCell(5).value = i.value || 'Sin valor';
                    worksheet.getRow(rowView).getCell(5).alignment = styles.alignment;

                    worksheet.getRow(rowView).height = 20;
                    rowView++;
                });
            } else {
                worksheet.mergeCells(`A${rowView}:E${rowView}`);
                worksheet.getRow(rowView).getCell(1).value = 'Sin indicadores';
                worksheet.getRow(rowView).getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                worksheet.getRow(rowView).height = 20;
                rowView++;
            }

            const buffer = await workbook.xlsx.writeBuffer();
			return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        } catch (error) {
            messageAlert('error', 'Ha ocurrido un error inesperado, intente nuevamente.');
        }
    };

    const generatePDF = async () => {
        const action = "/api/generate-pdf-end-project/";
        const formData = new FormData();
        formData.append("dataSee", JSON.stringify(dataSee));
        const response = await fetch(action, {
            method: "POST",
            body: formData,
        });
        const resp = await response.text();
        const { pdfBuffer } = JSON.parse(resp);

        const binaryString = window.atob(pdfBuffer);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const pdfBlob = new Blob([bytes], { type: "application/pdf" });

        return pdfBlob;
    };

    let urls = dataSee.end_project.evidence.map(e => e.file);

    const downloadZip = async () =>  {
        handleLoading('Generando informe...');
        const zip = new JSZip();
        const promises = [];

        const [pdfBlob, excelBlob] = await Promise.all([generatePDF(), generateExcel()]);

        zip.file(`CIERRE DE PROYECTO - ${dataSee.name}.pdf`, pdfBlob);
		zip.file(`CIERRE DE PROYECTO - ${dataSee.name}.xlsx`, excelBlob);

        urls.forEach(url => {
            promises.push(
                fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const fileName = url.substring(url.lastIndexOf('/') + 1);
                    zip.file(fileName, blob);
                })
            );
        });

        await Promise.all(promises);

        zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CIERRE DE PROYECTO - ${dataSee.name}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            messageAlert('success', 'Informe descargado correctamente');
        });
    };

</script>

<svelte:head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</svelte:head>

<ButtonLight typeButton="button" text="Descargar" action={downloadZip} styles="mr-0.5 w-4/5 flex justify-center sm:w-auto border-red-700 text-red-700 hover:bg-red-700 bg-gray-50"> 
    <DownloadIcon size={20} styles='mr-2' />
</ButtonLight>