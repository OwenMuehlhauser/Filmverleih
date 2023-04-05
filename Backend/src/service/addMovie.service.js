"use strict"

import DatabaseFactory from "../database.js";
import {ObjectId} from "mongodb";

/**
 * Geschäftslogik zur Verwaltung von Adressen. Diese Klasse implementiert die
 * eigentliche Anwendungslogik losgelöst vom technischen Übertragungsweg.
 * Die Adressen werden der Einfachheit halber in einer MongoDB abgelegt.
 */
export default class AddMovieService {
    /**
     * Konstruktor.
     */
    constructor() {
        this._movies = DatabaseFactory.database.collection("movies");
    }

    /**
     * Adressen suchen. Unterstützt wird lediglich eine ganz einfache Suche,
     * bei der einzelne Felder auf exakte Übereinstimmung geprüft werden.
     * Zwar unterstützt MongoDB prinzipiell beliebig komplexe Suchanfragen.
     * Um das Beispiel klein zu halten, wird dies hier aber nicht unterstützt.
     *
     * @param {Object} query Optionale Suchparameter
     * @return {Promise} Liste der gefundenen Adressen
     */
    async search(query) {
        let cursor = this._movies.find(query, {
            sort: {
                movieTitle: 1,
                reggiseur: 1,
            }
        });

        return cursor.toArray();
    }

    /**
     * Speichern einer neuen Adresse.
     *
     * @param {Object} movie Zu speichernde Adressdaten
     * @return {Promise} Gespeicherte Adressdaten
     */
    async create(movie) {
        movie = movie || {};

        let newMovie = {
            movieTitle: movie.movieTitle || "",
            reggiseur:  movie.reggiseur  || "",
            releaseDate:      movie.releaseDate      || "",
            playtime:      movie.playtime      || "",
        };

        let result = await this._movies.insertOne(newMovie);
        return await this._movies.findOne({_id: result.insertedId});
    }

    /**
     * Auslesen einer vorhandenen Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Gefundene Adressdaten
     */
    async read(id) {
        let result = await this._movies.findOne({_id: new ObjectId(id)});
        return result;
    }

    /**
     * Aktualisierung einer Adresse, durch Überschreiben einzelner Felder
     * oder des gesamten Adressobjekts (ohne die ID).
     *
     * @param {String} id ID der gesuchten Adresse
     * @param {[type]} address Zu speichernde Adressdaten
     * @return {Promise} Gespeicherte Adressdaten oder undefined
     */
    async update(id, movie) {
        let oldMovie = await this._movies.findOne({_id: new ObjectId(id)});
        if (!oldMovie) return;

        let updateDoc = {
            $set: {},
        }

        if (movie.movieTitle) updateDoc.$set.movieTitle = movie.movieTitle;
        if (movie.reggiseur)  updateDoc.$set.reggiseur  = movie.reggiseur;
        if (movie.releaseDate)      updateDoc.$set.releaseDate      = movie.releaseDate;
        if (movie.playtime)      updateDoc.$set.playtime      = movie.playtime;

        await this._movies.updateOne({_id: new ObjectId(id)}, updateDoc);
        return this._movies.findOne({_id: new ObjectId(id)});
    }

    /**
     * Löschen einer Adresse anhand ihrer ID.
     *
     * @param {String} id ID der gesuchten Adresse
     * @return {Promise} Anzahl der gelöschten Datensätze
     */
    async delete(id) {
        let result = await this._movies.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}
