import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mtifgheijvznrrweznmo.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Create client with fetch options for proxy if needed
export const supabaseStorage = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    // Use custom fetch with proxy if needed
    fetch: (url: string, options: any) => {
      // Add proxy support here if needed
      return fetch(url, {
        ...options,
        // Proxy configuration can be added here
      })
    }
  }
})

/**
 * Upload file to Supabase Storage
 * Automatically uploads to 'files' bucket
 */
export async function uploadFile(
  file: File | Buffer,
  fileName: string,
  bucket: string = 'files'
) {
  try {
    const { data, error } = await supabaseStorage
      .storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabaseStorage
      .storage
      .from(bucket)
      .getPublicUrl(fileName)

    return {
      success: true,
      path: data.path,
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: String(error)
    }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(filePath: string, bucket: string = 'files') {
  try {
    const { error } = await supabaseStorage
      .storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: String(error)
    }
  }
}

/**
 * List files in bucket
 */
export async function listFiles(bucket: string = 'files', path: string = '') {
  try {
    const { data, error } = await supabaseStorage
      .storage
      .from(bucket)
      .list(path)

    if (error) throw error

    return {
      success: true,
      files: data
    }
  } catch (error) {
    console.error('List error:', error)
    return {
      success: false,
      error: String(error)
    }
  }
}
