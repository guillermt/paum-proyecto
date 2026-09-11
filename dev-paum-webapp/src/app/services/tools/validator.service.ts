import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

   /**Funciones para las validaciones de los formulario*/
  required(input:any){
    return (input != undefined && input != null && input != "" && input.toString().trim().length > 0);
  }

  max(input:any, size:any){
    return (input.length <= size);
  }

  min(input:any, size:any){
    return (input.length >= size);
  }

  email(input:any){
    var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return input.match(regEx); // Invalid format
  }

  date(input:any){
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!input.match(regEx)) return false;  // Invalid format
    var d = new Date(input);
    if(Number.isNaN(d.getTime())) return false; // Invalid date
    return d.toISOString().slice(0,10) === input;
  }

  between(input:any, min:any, max:any){
    return (max >= input >= min);
  }

  numeric(input:any){
    return (!isNaN(parseFloat(input)) && isFinite(input));
  }

  maxDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals <= size);
  }

  minDecimals(input:any, size:any) {
    let decimals = 0;

    if (Math.floor(input) !== input && input.toString().split(".")[1]){
      decimals = input.toString().split(".")[1].length
    }

    return (decimals >= size);
  }

  dateBetween(input:any, min:any, max:any){

    input = new Date(input).getTime();
    min = new Date(min).getTime();
    max = new Date(max).getTime();

    return  (max >= input && input  >= min);

  }

  words(input:any){
    let pat = new RegExp('^([A-Za-zÑñáéíóúÁÉÍÓÚ ]+)$');
    console.log(pat.test(input), input);
    return pat.test(input);
  }

  //agregado

  alphanumeric(input:any): boolean{
    // Permite letras (mayúsculas/minúsculas) y números SIN espacios.
    let pat = new RegExp('^([A-Za-z0-9]+)$');
    return pat.test(input);
  }

onlyLetters(input:any): boolean{
    // Expresión regular para letras, acentos, ñ/Ñ y espacios.
    let pat = new RegExp('^([A-Za-zÑñáéíóúÁÉÍÓÚ ]+)$');
    return pat.test(input);
  }

minAge(input: any, age: number): boolean {
      if (!this.date(input)) {
          return false;
      }

      const birthDate = new Date(input);
      const today = new Date();

      if (birthDate.getTime() > today.getTime()) {
          return false;
    }

    let limitDate = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());

    return birthDate.getTime() <= limitDate.getTime();
  }
  //pal eventos
  // Valida si un texto contiene solo letras, números y espacios
    alphanumericAndSpaces(input: any): boolean {
        let pat = new RegExp(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]+$/);
        return pat.test(input);
    }

    // Valida si un texto contiene letras, números, espacios y signos de puntuación básicos
    alphanumericPunctuation(input: any): boolean {
        let pat = new RegExp(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 .,;:!?()"\-]+$/);
        return pat.test(input);
    }

    // Valida que el campo sea un número entero de 1 a 3 dígitos
    maxThreeDigitPositiveInteger(input: any): boolean {
        let pat = new RegExp(/^[0-9]{1,3}$/);
        return pat.test(input);
    }

    // Valida que la fecha tenga el formato YYYY-MM-DD y no sea una fecha pasada
    isFutureDate(dateString: string): boolean {
        // Primero validar el formato (usa la función 'date' existente)
        if (!this.date(dateString)) return false;

        const fechaIngresada = new Date(dateString);
        const hoy = new Date();
        // Setear hora a 0 para comparar solo la fecha
        hoy.setHours(0, 0, 0, 0);

        // La fecha debe ser igual o posterior a hoy
        return fechaIngresada.getTime() >= hoy.getTime();
    }
}
