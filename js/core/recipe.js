export const RECIPE_SCHEMA_VERSION=1;

const MODULE_VERSIONS={"maze-studio":1,"coloring-studio":1};

function clone(value){return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value))}

export function createRecipe({module,title,seed=null,settings={},asset=null,assets=null,meta={}}){
  if(!module)throw new Error("Recipe wymaga nazwy modułu");
  return{
    schemaVersion:RECIPE_SCHEMA_VERSION,
    module,
    moduleVersion:MODULE_VERSIONS[module]||1,
    title:title||"Strona",
    seed:seed===null?null:Number(seed)>>>0,
    settings:clone(settings||{}),
    ...(asset?{asset:clone(asset)}:{}),
    ...(assets?{assets:clone(assets)}:{}),
    meta:{createdWith:"FENIX Mobile",...clone(meta||{})}
  };
}

export function normalizeRecipe(source={}){
  const recipe=source.recipe?clone(source.recipe):createRecipe(source);
  return createRecipe({...recipe,module:recipe.module||source.module,title:recipe.title||source.title,seed:recipe.seed??source.seed,settings:recipe.settings||source.settings,asset:recipe.asset||source.asset,assets:recipe.assets||source.assets,meta:recipe.meta||{}});
}

export function pageFromRecipe(recipe,{id,createdAt,updatedAt}={}){
  const normalized=normalizeRecipe(recipe);
  return{id,createdAt,updatedAt,recipe:normalized,module:normalized.module,title:normalized.title,seed:normalized.seed,settings:normalized.settings,...(normalized.asset?{asset:normalized.asset}:{}),...(normalized.assets?{assets:normalized.assets}:{})};
}

export function migratePage(page){
  if(page?.recipe?.schemaVersion===RECIPE_SCHEMA_VERSION)return pageFromRecipe(page.recipe,page);
  return pageFromRecipe(normalizeRecipe(page),page||{});
}

export function migrateProject(project){return{...project,pages:(project?.pages||[]).map(migratePage)}}
