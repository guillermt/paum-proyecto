import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Archivo, ArchivosService } from '../../services/archivos.service';
import * as mammoth from 'mammoth';

@Component({
  selector: 'app-visor-screen',
  templateUrl: './visor-screen.component.html',
  styleUrls: ['./visor-screen.component.scss']
})
export class VisorScreenComponent implements OnInit, OnDestroy {
  archivo?: Archivo;
  archivoUrl?: SafeResourceUrl;
  archivoHtml?: SafeHtml;
  archivoBlobUrl = '';
  esDocumentoWord = false;
  wordNoCompatible = false;
  errorMessage = '';
  cargando = true;
  materiaId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private archivosService: ArchivosService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const materiaId = Number(this.route.snapshot.paramMap.get('idMateria'));
    const archivoId = Number(this.route.snapshot.paramMap.get('idArchivo'));
    this.materiaId = Number.isInteger(materiaId) && materiaId > 0 ? materiaId : undefined;

    if (!Number.isInteger(archivoId) || archivoId <= 0) {
      this.errorMessage = 'No se especificó un archivo válido.';
      this.cargando = false;
      return;
    }

    this.archivosService.descargarArchivo(archivoId).subscribe({
      next: (blob) => this.prepararArchivo(blob, archivoId),
      error: () => {
        this.errorMessage = 'No fue posible visualizar el archivo.';
        this.cargando = false;
      }
    });
  }

  private async prepararArchivo(blob: Blob, archivoId: number): Promise<void> {
    this.archivoBlobUrl = URL.createObjectURL(blob);
    const tipo = blob.type.toLowerCase();
    this.esDocumentoWord = tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || tipo === 'application/msword';
    this.archivo = {
      id: archivoId,
      nombre: this.obtenerNombreArchivo(blob.type, archivoId),
      tipo: blob.type,
      mime_type: blob.type
    };

    if (tipo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const resultado = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() }, {
          convertImage: mammoth.images.imgElement((image) => image.read('base64').then((data) => ({
            src: `data:${image.contentType};base64,${data}`
          })))
        });
        this.archivoHtml = this.sanitizer.bypassSecurityTrustHtml(resultado.value);
      } catch {
        this.errorMessage = 'No fue posible convertir el documento Word para visualizarlo.';
      }
    } else if (tipo === 'application/msword') {
      this.wordNoCompatible = true;
    } else {
      this.archivoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.archivoBlobUrl);
    }

    this.cargando = false;
  }

  descargar(): void {
    if (!this.archivoBlobUrl || !this.archivo) {
      return;
    }

    const enlace = document.createElement('a');
    enlace.href = this.archivoBlobUrl;
    enlace.download = this.archivo.nombre;
    enlace.click();
  }

  volver(): void {
    this.router.navigate(this.materiaId ? ['/user', this.materiaId] : ['/user']);
  }

  ngOnDestroy(): void {
    if (this.archivoBlobUrl) {
      URL.revokeObjectURL(this.archivoBlobUrl);
    }
  }

  private obtenerNombreArchivo(tipo: string, id: number): string {
    const extensiones: Record<string, string> = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
    };
    return `archivo-${id}.${extensiones[tipo] || 'bin'}`;
  }

}
