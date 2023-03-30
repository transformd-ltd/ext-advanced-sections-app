# Ext Advanced Sections App

This repo is used for creating a package that acts as a wrapper for hosted apps on the platform.

## Manifest

The hosted apps require an incremental versioning to differentiate versions.

There is a `manifest.json` in the project root which contains `version`, `id` and `name` properties, among others.

These are used for identification of apps in the platform, but the most important is the `version`.

Use semantic versioning (major/minor/patch) and see the below releases section for more info.

## Customising

The base styles come `theme-fermi`, but additional styles can be added by placing an `index.scss` file inside of `/src/layout`.

From this `index.scss` file you can import other SASS/SCSS files as you need.

At this point you will need to have SASS globally installed on your system, as we as compiling the SASS manually ourselves, before using the output CSS file in the general app build process.

The build process up to and including the creation of the `app.zip` (which gets uploaded to the hosted apps) can be achieved by running the following commands:

`yarn sass`
`yarn build`
`yarn package`

Or alternatively, you can run `yarn full` to complete the entire process.

## Branches

As hosted apps are different per client, it is best practice to make a new branch per project, and keep the the base `develop` branch generic.

As an example, FujiFilm has 2 projects, GVGS and ATC. As such, there is a `fuji-gvgs` and `fuji-atc` branch, with specific styling requirements of each project in their respective branches.

## Releases

Some clients may want access to the final `app.zip` for them to upload to their production environment hosted apps.

Because of this, we create a new release for each change that a client requests. 

Release tags should reflect the version number of the `manifest.json`, and be suffixed with an identifying name relating to the client. For example, `v.4.5.0` for `fuji-atc` should be tagged as `v.4.5.0-atc`. The actual release name should be the version number prefixed with the client/project, for example `Fuji ATC 4.5.0`.